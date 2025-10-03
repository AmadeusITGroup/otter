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
  logger,
} from '../utils/logger';

async function listOrgRepos(octokit: Octokit) {
  const repos = (await octokit.paginate(octokit.repos.listForOrg, {
    org: process.env.O3R_MCP_GITHUB_ORG as string,
    per_page: 100,
    type: 'all',
    sort: 'updated' // Prioritize recently updated repositories
  })).filter((repo) => !repo.archived && !repo.fork);
  logger.info(`Found ${repos.length} repositories in the organization ${process.env.O3R_MCP_GITHUB_ORG}`);
  return repos;
}

type Repository = Awaited<ReturnType<typeof listOrgRepos>>[number];

function findPackageJsonFiles(octokit: Octokit) {
  return async (repository: Repository) => {
    const owner = process.env.O3R_MCP_GITHUB_ORG as string;
    const repo = repository.name;
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

const O3R_SCOPE_REGEX = /^@(o3r|ama-styling|ama-mfe|ama-sdk)\//gm;

function dependsOnOtter(octokit: Octokit) {
  return async (repository: Repository, packageJsonPath: string) => {
    const owner = process.env.O3R_MCP_GITHUB_ORG as string;
    const repo = repository.name;
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path: packageJsonPath
    });
    if (Array.isArray(data) || data.type !== 'file') {
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

async function findRepositoriesUsingOtter(octokit: Octokit, reposUsingOtter: string[]) {
  const cacheFolderPath = process.env.O3R_MCP_CACHE_PATH || '.cache/o3r/mcp';
  const cachePath = resolve(cacheFolderPath, 'repos-using-otter.json');
  let cachedRepos: Record<string, boolean> = {};
  if (process.env.O3R_MCP_USE_CACHED_REPOS === 'false') {
    logger.info('Ignoring cached repositories as O3R_MCP_USE_CACHED_REPOS is set to false');
  } else {
    try {
      cachedRepos = JSON.parse(await readFile(cachePath, { encoding: 'utf8' })) as Record<string, boolean>;
      reposUsingOtter.push(...Object.entries(cachedRepos).filter(([, usesOtter]) => usesOtter).map(([repo]) => repo));
      logger.info(`Loaded ${Object.keys(cachedRepos).length} cached repositories, ${reposUsingOtter.length} of them using Otter dependencies.`);
    } catch (e) {
      logger.info('No cache file found, starting fresh search for repositories using Otter dependencies.', e);
    }
  }
  const repositories = (await listOrgRepos(octokit)).filter((r) => !cachedRepos[r.full_name]);
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
      cachedRepos[repository.full_name] = false;
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
          cachedRepos[repository.full_name] = true;
        } else {
          throw new Error('No Otter dependencies found in this package.json');
        }
      }));
    } catch {}
    cachedRepos[repository.full_name] ||= false;
  }));
  logger.info(`Found ${reposUsingOtter.length} repositories using Otter dependencies in the organization ${process.env.O3R_MCP_GITHUB_ORG}`);
  if (process.env.O3R_MCP_USE_CACHED_REPOS === 'false') {
    logger.info('Not updating cache as O3R_MCP_USE_CACHED_REPOS is set to false');
  } else {
    if (!existsSync(cacheFolderPath)) {
      await mkdir(cacheFolderPath, { recursive: true });
    }
    try {
      await writeFile(cachePath, JSON.stringify(cachedRepos, Object.keys(cachedRepos).sort()));
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
  if (!process.env.O3R_MCP_GITHUB_ORG) {
    logger.error('Missing O3R_MCP_GITHUB_ORG environment variable');
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
      description: 'List all repositories in the specified GitHub organization that use Otter dependencies (@o3r/* or @ama-*/*) in their package.json files.',
      annotations: {
        readOnlyHint: true,
        openWorldHint: false
      }
    },
    () => ({
      content: [
        {
          type: 'text',
          text: (isLookingForRepos ? 'I did not finish to look for repositories. For the moment:\n' : '')
            + reposUsingOtter.length
            ? `The following repositories in the organization ${process.env.O3R_MCP_GITHUB_ORG} use Otter dependencies:\n`
            + reposUsingOtter.sort().map((repo) => `- ${repo}`).join('\n')
            : `No repositories in the organization ${process.env.O3R_MCP_GITHUB_ORG} were found to use Otter dependencies.`
        }
      ]
    })
  );
}
