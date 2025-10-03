import type {
  McpServer,
} from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  Octokit,
} from '@octokit/rest';

async function listOrgRepos(octokit: Octokit) {
  const repos = (await octokit.paginate(octokit.repos.listForOrg, {
    org: process.env.GITHUB_ORG as string,
    per_page: 100,
    type: 'all',
    sort: 'updated' // Prioritize recently updated repositories
  })).filter((repo) => !repo.archived && !repo.fork);
  console.error(`Found ${repos.length} repositories in the organization ${process.env.GITHUB_ORG}`);
  return repos;
}

type Repository = Awaited<ReturnType<typeof listOrgRepos>>[number];

function findPackageJsonFiles(octokit: Octokit) {
  return async (repository: Repository) => {
    const owner = process.env.GITHUB_ORG as string;
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

function dependsOnOtter(octokit: Octokit) {
  return async (repository: Repository, packageJsonPath: string) => {
    const owner = process.env.GITHUB_ORG as string;
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
    ].some((dep) => /^@(o3r|ama)/.test(dep));
  };
}

const reposUsingOtter: Repository[] = [];
let isLookingForRepos = false;

async function findRepositoriesUsingOtter(octokit: Octokit) {
  isLookingForRepos = true;
  const repositories = await listOrgRepos(octokit);
  const findPackageJsonFilesInRepo = findPackageJsonFiles(octokit);
  const dependsOnOtterInRepo = dependsOnOtter(octokit);

  for (const repository of repositories) {
    console.error(`Checking repository ${repository.full_name}...`);
    try {
      const packageJsonFiles = await findPackageJsonFilesInRepo(repository);
      for (const packageJsonFile of packageJsonFiles) {
        if (await dependsOnOtterInRepo(repository, packageJsonFile.path)) {
          reposUsingOtter.push(repository);
          console.error(`Repository ${repository.full_name} uses Otter dependencies`);
          break;
        }
      }
    } catch (e) {
      console.error(`Error processing repository ${repository.full_name}:`, e);
    }
  }
  isLookingForRepos = false;
  console.error(`Found ${reposUsingOtter.length} repositories using Otter dependencies in the organization ${process.env.GITHUB_ORG}`);
}

/**
 * Register the get repositories using otter tool.
 * @param server
 */
export function registerGetRepositoriesUsingOtterTool(server: McpServer) {
  if (!process.env.GITHUB_TOKEN) {
    console.error('Missing GITHUB_TOKEN environment variable for search_code_example tool');
    return;
  }
  if (!process.env.GITHUB_ORG) {
    console.error('Missing GITHUB_ORG environment variable');
    return;
  }

  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

  findRepositoriesUsingOtter(octokit).catch((e) => {
    console.error('Error finding repositories using Otter:', e);
  });

  server.registerTool(
    'get_repositories_using_otter',
    {
      title: 'Get repositories using Otter dependencies',
      description: 'List all repositories in the specified GitHub organization that use Otter dependencies (@o3r/* or @ama/*) in their package.json files.',
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
            ? `The following repositories in the organization ${process.env.GITHUB_ORG} use Otter dependencies:\n`
            + reposUsingOtter.map((repo) => `- [${repo.full_name}](${repo.html_url})`).join('\n')
            : `No repositories in the organization ${process.env.GITHUB_ORG} were found to use Otter dependencies.`
        }
      ]
    })
  );
}
