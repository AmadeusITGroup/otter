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
  owner,
  repo,
} from '../utils/otter';

async function getSupportedReleases(octokit: Octokit) {
  const supportedReleases = (await octokit.paginate(octokit.repos.listBranches, { owner, repo }))
    .filter((branch) => /^release\/\d+\.\d+$/.test(branch.name))
    .map((branch) => branch.name.replace('release/', ''));

  logger.info(`Supported releases:\n${supportedReleases.map((r) => `  - ${r}`).join('\n')}`);
  return supportedReleases;
}

/**
 * Register the create monorepo with app tool.
 * @param server
 */
export async function registerSupportedReleaseTool(server: McpServer): Promise<void> {
  if (!process.env.O3R_MCP_GITHUB_TOKEN) {
    logger.error('Missing O3R_MCP_GITHUB_TOKEN environment variable for get_supported_releases tool');
    return;
  }

  const octokit = new Octokit({ auth: process.env.O3R_MCP_GITHUB_TOKEN });
  const supportedReleases = await getSupportedReleases(octokit);

  server.registerTool(
    'get_supported_releases',
    {
      title: 'Get Otter Supported Releases',
      description: 'Get the list of Otter supported releases',
      outputSchema: {
        releases: z.array(z.string()).describe('List of supported releases')
      }
    },
    () => {
      return {
        content: [
          {
            type: 'text',
            text: `The supported releases for Otter are: \n${supportedReleases.map((r) => `  - ${r}`).join('\n')}`
          }
        ],
        structuredContent: {
          releases: supportedReleases
        }
      };
    }
  );
}
