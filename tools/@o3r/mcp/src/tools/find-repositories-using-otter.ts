import {
  existsSync,
} from 'node:fs';
import {
  mkdir,
  readFile,
  writeFile,
} from 'node:fs/promises';
import {
  resolve,
} from 'node:path';
import type {
  McpServer,
} from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  Octokit,
} from '@octokit/rest';
import {
  z,
} from 'zod';
import {
  logger,
} from '../utils/logger';
import {
  OTTER_SCOPES,
} from '../utils/otter';

async function listRepos(octokit: Octokit) {
  // We use several requests and not only one with OR
  // because GitHub search API has some limitations in the query length and complexity
  // Note: We can do only 10 searches per minute,
  // so we should found another solution if we have more than 10 scopes to look for.
  const search = (await Promise.all(OTTER_SCOPES
    .map(async (scope) => {
      const repos = (await octokit.paginate(octokit.search.code, { q: `@${scope}/ filename:package.json`, per_page: 100 }));
      // eslint-disable-next-line @typescript-eslint/naming-convention -- Naming convention from GitHub API
      const reposWithOnlyNeededInfo = repos.map(({ repository: { name, full_name, fork, archived, default_branch } }) => ({ name, full_name, fork, archived, default_branch }));
      const filteredRepos = reposWithOnlyNeededInfo.filter((repo) => !repo.archived && !repo.fork);
      logger.info(`Found ${filteredRepos.length} repositories with references to @${scope} in package.json`);
      return filteredRepos;
    })
  )).flat();
  const repositories = Array.from(new Map(search.map(({ fork, archived, ...repo }) => [repo.full_name, repo])).values());
  logger.info(`Found ${repositories.length} repositories with references to Otter`);
  return repositories;
}

type Repository = Awaited<ReturnType<typeof listRepos>>[number];

function findPackageJsonFiles(octokit: Octokit) {
  return async (repository: Repository) => {
    const [owner, repo] = repository.full_name.split('/');
    const { data: { commit: { sha } } } = await octokit.repos.getBranch({
      owner,
      repo,
      branch: repository.default_branch || 'main'
    });
    const { data: { tree } } = await octokit.git.getTree({
      owner,
      repo,
      tree_sha: sha
    });
    return tree.filter((t) => t.type === 'blob' && t.path.endsWith('package.json'));
  };
}

const O3R_SCOPE_REGEX = new RegExp(`^@(?:${OTTER_SCOPES.join('|')})/`, 'gm');

function dependsOnOtter(octokit: Octokit) {
  return async (repository: Repository, packageJsonPath: string) => {
    const [owner, repo] = repository.full_name.split('/');
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path: packageJsonPath
    });
    if (Array.isArray(data) || data.type !== 'file' || data.encoding !== 'base64') {
      throw new Error('Unexpected content response structure');
    }
    const content = Buffer.from(data.content, 'base64').toString('utf8');
    const packageJson = JSON.parse(content) as { dependencies?: Record<string, string>; devDependencies?: Record<string, string> };
    return [
      ...Object.keys(packageJson.devDependencies || {}),
      ...Object.keys(packageJson.dependencies || {})
    ].some((dep) => O3R_SCOPE_REGEX.test(dep));
  };
}

interface CacheRepository {
  /** True if it depends on Otter */
  dependsOn: boolean;
  /** When it was checked */
  when: string;
}

/** Key are the fullName of each repository */
type Cache = Record<string, CacheRepository>;

const DEFAULT_O3R_MCP_CACHE_MAX_AGE = 90;

const convertDaysToMs = (days: number) => days * 1000 * 60 * 60 * 24;

function validateCache(cachedRepos: Cache) {
  const now = Date.now();
  const maxAge = convertDaysToMs(+(process.env.O3R_MCP_CACHE_MAX_AGE || DEFAULT_O3R_MCP_CACHE_MAX_AGE));
  Object.entries(cachedRepos).forEach(([repo, { when }]) => {
    const whenDate = new Date(when);
    if (Number.isNaN(whenDate.getTime()) || (now - whenDate.getTime()) > maxAge) {
      logger.info(`Cache for repository ${repo} is outdated or invalid, removing it`);
      delete cachedRepos[repo];
    }
  });
}

async function findRepositoriesUsingOtter(octokit: Octokit, reposUsingOtter: string[]) {
  const cacheFolderPath = process.env.O3R_MCP_CACHE_PATH || '.cache/o3r/mcp';
  const cachePath = resolve(cacheFolderPath, 'repos-using-otter.json');
  let cachedRepos: Cache = {};
  if (process.env.O3R_MCP_USE_CACHED_REPOS === 'false') {
    logger.info('Ignoring cached repositories as O3R_MCP_USE_CACHED_REPOS is set to false');
  } else {
    try {
      cachedRepos = JSON.parse(await readFile(cachePath, { encoding: 'utf8' })) as Cache;
      validateCache(cachedRepos);
      reposUsingOtter.push(...Object.entries(cachedRepos).filter(([, usesOtter]) => usesOtter).map(([repo]) => repo));
      logger.info(`Loaded ${Object.keys(cachedRepos).length} cached repositories, ${reposUsingOtter.length} of them using Otter dependencies.`);
    } catch (e) {
      logger.info('No cache file found, starting fresh search for repositories using Otter dependencies.', e);
    }
  }
  const repositories = (await listRepos(octokit)).filter((r) => !cachedRepos[r.full_name]?.dependsOn);

  const findPackageJsonFilesInRepo = findPackageJsonFiles(octokit);
  const dependsOnOtterInRepo = dependsOnOtter(octokit);

  await Promise.allSettled(repositories.map(async (repository) => {
    logger.debug(`Checking repository ${repository.full_name}...`);
    const packageJsonFiles: Awaited<ReturnType<typeof findPackageJsonFilesInRepo>> = [];
    try {
      packageJsonFiles.push(...await findPackageJsonFilesInRepo(repository));
    } catch (e) {
      logger.warn(`Failed to list package.json files in repository ${repository.full_name}`, e);
    }
    if (packageJsonFiles.length === 0) {
      logger.info(`No package.json files found in repository ${repository.full_name}`);
      cachedRepos[repository.full_name] = {
        dependsOn: false,
        when: new Date().toISOString()
      };
      return;
    }
    try {
      await Promise.any(packageJsonFiles.map(async (packageJsonFile) => {
        let depFound = false;
        try {
          depFound = await dependsOnOtterInRepo(repository, packageJsonFile.path);
        } catch (e) {
          logger.error(`Failed to check package.json file at ${packageJsonFile.path} in repository ${repository.full_name}`, e);
        }
        if (depFound) {
          reposUsingOtter.push(repository.full_name);
          logger.info(`Repository ${repository.full_name} uses Otter dependencies`);
          cachedRepos[repository.full_name] = {
            dependsOn: true,
            when: new Date().toISOString()
          };
        } else {
          throw new Error('No Otter dependencies found in this package.json');
        }
      }));
    } catch {}
    cachedRepos[repository.full_name] ||= {
      dependsOn: false,
      when: new Date().toISOString()
    };
  }));
  logger.info(`Found ${reposUsingOtter.length} repositories using Otter dependencies`);
  if (process.env.O3R_MCP_USE_CACHED_REPOS === 'false') {
    logger.info('Not updating cache as O3R_MCP_USE_CACHED_REPOS is set to false');
  } else {
    if (!existsSync(cacheFolderPath)) {
      await mkdir(cacheFolderPath, { recursive: true });
    }
    try {
      await writeFile(cachePath, JSON.stringify(cachedRepos));
    } catch (e) {
      logger.error('Failed to update cache', e);
    }
  }
}

/**
 * Register the get repositories using otter tool.
 * @param server
 */
export function registerGetRepositoriesUsingOtterTool(server: McpServer) {
  if (!process.env.O3R_MCP_GITHUB_TOKEN) {
    logger.error('Missing O3R_MCP_GITHUB_TOKEN environment variable for search_code_example tool');
    return;
  }

  const octokit = new Octokit({ auth: process.env.O3R_MCP_GITHUB_TOKEN });

  let isLookingForRepos = true;
  const reposUsingOtter: string[] = [];
  findRepositoriesUsingOtter(octokit, reposUsingOtter).catch((e) => {
    logger.error('Error finding repositories using Otter:', e);
  });
  isLookingForRepos = false;

  server.registerTool(
    'get_repositories_using_otter',
    {
      title: 'Get repositories using Otter dependencies',
      description: `List all repositories that use Otter dependencies (${OTTER_SCOPES.map((scope) => `@${scope}`).join(' or ')}) in their package.json files.`,
      annotations: {
        readOnlyHint: true,
        openWorldHint: false
      },
      outputSchema: {
        repositories: z.array(z.string()).describe('List of repositories using Otter dependencies')
      }
    },
    () => ({
      content: [
        {
          type: 'text',
          text: (isLookingForRepos ? 'I did not finish to look for repositories. For the moment:\n' : '')
            + reposUsingOtter.length
            ? `The following repositories use Otter dependencies:\n`
            + reposUsingOtter.sort().map((repo) => `- ${repo}`).join('\n')
            : `No repositories were found to use Otter dependencies.`
        }
      ],
      structuredContent: {
        repositories: reposUsingOtter
      }
    })
  );
}
