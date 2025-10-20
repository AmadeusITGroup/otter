import {
  existsSync,
} from 'node:fs';
import {
  mkdir,
  readFile,
  writeFile,
} from 'node:fs/promises';
import {
  dirname,
  resolve,
} from 'node:path';
import {
  type Logger,
  MCPLogger,
  type ToolDefinition,
} from '@ama-mcp/core';
import type {
  McpServer,
} from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  Octokit,
} from '@octokit/rest';
import {
  z,
} from 'zod';
import type {
  GithubToolOptions,
} from '../utils';

/**
 * Options for the tool get_repositories_using_library
 */
export interface GetRepositoriesUsingLibraryOptions extends GithubToolOptions, ToolDefinition {
  /**
   * Scopes to look for when searching for repositories
   * (e.g. for @ama-mcp/github, the scope is ama-mcp)
   * Limit to 10 scopes to avoid hitting GitHub search API rate limit
   * @example ['ama-mcp', 'o3r']
   */
  scopes: string[];
  /**
   * Name of the library to look for in the dependencies
   * @example 'Otter'
   */
  libraryName: string;
  /**
   * Path to cache the results
   */
  cachePath?: string;
  /**
   * Whether to use the cached results if available
   */
  disableCache?: boolean;
  /**
   * Maximum age in days of the cache for a repository to be considered valid
   */
  cacheMaxAge?: number;
}

type SearchCodeResponse = Awaited<ReturnType<Octokit['search']['code']>>;
type SearchCodeResultsItem = SearchCodeResponse['data']['items'][number];

type Repository = Pick<
  SearchCodeResultsItem['repository'],
  'name' | 'full_name' | 'fork' | 'archived' | 'default_branch'
>;

async function listRepos(octokit: Octokit, options: GetRepositoriesUsingLibraryOptions, logger: Logger) {
  // We use several requests and not only one with OR
  // because GitHub search API has some limitations in the query length and complexity
  // Note: We can do only 10 searches per minute,
  // so we should found another solution if we have more than 10 scopes to look for.
  const search = (await Promise.allSettled(options.scopes
    .map(async (scope) => {
      const repos = (await octokit.paginate(octokit.search.code, { q: `@${scope}/ filename:package.json`, per_page: 100 }))
        // eslint-disable-next-line @typescript-eslint/naming-convention -- Naming convention from GitHub API
        .map(({ repository: { name, full_name, fork, archived, default_branch } }) => ({ name, full_name, fork, archived, default_branch }))
        .filter((repo) => !repo.archived && !repo.fork);
      logger.info?.(`Found ${repos.length} repositories with references to @${scope} in package.json`);
      return repos as Repository[];
    })
  )).filter((result): result is PromiseFulfilledResult<Repository[]> => result.status === 'fulfilled')
    .flatMap((result) => result.value);
  // Deduplicate repositories in case of multiple scopes matching the same repository
  const repositories = Array.from(new Map(search.map((repo) => [repo.full_name, repo])).values());
  logger.info?.(`Found ${repositories.length} repositories with references to ${options.libraryName}`);
  return repositories;
}

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

function dependsOnLibrary(octokit: Octokit, options: GetRepositoriesUsingLibraryOptions) {
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
    const scopeRegex = new RegExp(`^@(?:${options.scopes.join('|')})/`);
    return [
      ...Object.keys(packageJson.devDependencies || {}),
      ...Object.keys(packageJson.dependencies || {})
    ].some((dep) => scopeRegex.test(dep));
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

const DEFAULT_AMA_MCP_CACHE_MAX_AGE = 90;

const convertDaysToMs = (days: number) => days * 1000 * 60 * 60 * 24;

function validateCache(cachedRepos: Cache, options: GetRepositoriesUsingLibraryOptions, logger: Logger) {
  const now = Date.now();
  const maxAge = convertDaysToMs(options.cacheMaxAge || DEFAULT_AMA_MCP_CACHE_MAX_AGE);
  Object.entries(cachedRepos).forEach(([repo, { when }]) => {
    const whenDate = new Date(when);
    if (Number.isNaN(whenDate.getTime()) || (now - whenDate.getTime()) > maxAge) {
      logger.info?.(`Cache for repository ${repo} is outdated or invalid, removing it`);
      delete cachedRepos[repo];
    }
  });
}

async function findRepositoriesUsingLibrary(octokit: Octokit, reposUsingLibrary: string[], options: GetRepositoriesUsingLibraryOptions, logger: Logger) {
  const {
    cachePath = resolve('.cache', '@ama-mcp', `repos-using-${options.libraryName.toLowerCase().replaceAll(/\s+/g, '-')}.json`),
    disableCache = false
  } = options;
  let cachedRepos: Cache = {};
  if (disableCache) {
    logger.info?.('Ignoring cached repositories as caching is disabled');
  } else {
    try {
      cachedRepos = JSON.parse(await readFile(cachePath, { encoding: 'utf8' })) as Cache;
      validateCache(cachedRepos, options, logger);
      reposUsingLibrary.push(...Object.entries(cachedRepos).filter(([, usesLibrary]) => usesLibrary).map(([repo]) => repo));
      logger.info?.(`Loaded ${Object.keys(cachedRepos).length} cached repositories, ${reposUsingLibrary.length} of them using ${options.libraryName} dependencies.`);
    } catch (e) {
      logger.info?.(`No cache file found, starting fresh search for repositories using ${options.libraryName} dependencies.`, e);
    }
  }
  const repositories = (await listRepos(octokit, options, logger)).filter((r) => !cachedRepos[r.full_name]?.dependsOn);
  const findPackageJsonFilesInRepo = findPackageJsonFiles(octokit);
  const dependsOnLibraryInRepo = dependsOnLibrary(octokit, options);

  await Promise.allSettled(repositories.map(async (repository) => {
    logger.debug?.(`Checking repository ${repository.full_name}...`);
    const packageJsonFiles: Awaited<ReturnType<typeof findPackageJsonFilesInRepo>> = [];
    try {
      packageJsonFiles.push(...await findPackageJsonFilesInRepo(repository));
    } catch (e) {
      logger.warn?.(`Failed to list package.json files in repository ${repository.full_name}`, e);
    }
    if (packageJsonFiles.length === 0) {
      logger.info?.(`No package.json files found in repository ${repository.full_name}`);
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
          depFound = await dependsOnLibraryInRepo(repository, packageJsonFile.path);
        } catch (e) {
          logger.error?.(`Failed to check package.json file at ${packageJsonFile.path} in repository ${repository.full_name}`, e);
        }
        if (depFound) {
          reposUsingLibrary.push(repository.full_name);
          logger.info?.(`Repository ${repository.full_name} uses ${options.libraryName} dependencies`);
          cachedRepos[repository.full_name] = {
            dependsOn: true,
            when: new Date().toISOString()
          };
        } else {
          throw new Error(`No ${options.libraryName} dependencies found in this package.json`);
        }
      }));
    } catch {}
    cachedRepos[repository.full_name] ||= {
      dependsOn: false,
      when: new Date().toISOString()
    };
  }));
  logger.info?.(`Found ${reposUsingLibrary.length} repositories using ${options.libraryName} dependencies`);
  if (disableCache) {
    logger.info?.('Not updating cache as caching is disabled');
  } else {
    const cacheFolderPath = dirname(cachePath);
    if (!existsSync(dirname(cacheFolderPath))) {
      await mkdir(cacheFolderPath, { recursive: true });
    }
    try {
      await writeFile(cachePath, JSON.stringify(cachedRepos));
    } catch (e) {
      logger.error?.('Failed to update cache', e);
    }
  }
}

/**
 * Register the tool to get repositories using a configured library.
 * @param server
 * @param options
 */
export function registerGetRepositoriesUsingLibraryTool(server: McpServer, options: GetRepositoriesUsingLibraryOptions) {
  const {
    githubToken,
    libraryName,
    toolName = `get_repositories_using_${options.libraryName.toLowerCase().replaceAll(/\s+/g, '_')}`,
    toolTitle = `Get repositories using ${options.libraryName} dependencies`,
    toolDescription = `List all repositories that use ${options.libraryName} dependencies (${options.scopes.map((scope) => `@${scope}`).join(' or ')}) in their package.json files.`
  } = options;

  const logger = options.logger ?? new MCPLogger(toolName, options.logLevel);

  if (!githubToken) {
    logger.error?.(`Missing githubToken for ${toolName}`);
    return;
  }

  const octokit = new Octokit({ auth: githubToken });

  let isLookingForRepos = true;
  const reposUsingLibrary: string[] = [];
  findRepositoriesUsingLibrary(octokit, reposUsingLibrary, options, logger).catch((e) => {
    logger.error?.(`Error finding repositories using ${libraryName}:`, e);
  });
  isLookingForRepos = false;

  server.registerTool(
    toolName,
    {
      title: toolTitle,
      description: toolDescription,
      annotations: {
        readOnlyHint: true,
        openWorldHint: false
      },
      outputSchema: {
        repositories: z.array(z.string()).describe(`List of repositories depending on ${libraryName}`)
      }
    },
    () => ({
      content: [
        {
          type: 'text',
          text: (isLookingForRepos ? 'I did not finish to look for repositories. For the moment:\n' : '')
            + reposUsingLibrary.length
            ? `The following repositories use ${libraryName} dependencies:\n`
            + reposUsingLibrary.sort().map((repo) => `- ${repo}`).join('\n')
            : `No repositories found using ${libraryName} dependencies.`
        }
      ],
      structuredContent: {
        repositories: reposUsingLibrary
      }
    })
  );
}
