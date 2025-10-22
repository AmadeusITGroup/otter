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
  GitHubRepositoryToolOptions,
} from '../utils';

/**
 * Options for the tool to get supported releases
 * @experimental
 */
export interface SupportedReleasesOptions extends ToolDefinition, GitHubRepositoryToolOptions {
  /**
   * Optional library name
   */
  libraryName?: string;
}

async function getSupportedReleases(octokit: Octokit, options: SupportedReleasesOptions, logger: Logger) {
  const { owner, repo } = options;
  const supportedReleases = (await octokit.paginate(octokit.repos.listBranches, { owner, repo }))
    .filter((branch) => /^release\/\d+\.\d+$/.test(branch.name))
    .map((branch) => branch.name.replace('release/', ''));

  logger.info?.(`Supported releases:\n${supportedReleases.map((r) => `  - ${r}`).join('\n')}`);
  return supportedReleases;
}

/**
 * Register the supported releases tool.
 * @param server
 * @param options
 * @experimental
 */
export async function registerSupportedReleasesTool(server: McpServer, options: SupportedReleasesOptions): Promise<void> {
  const {
    githubToken,
    libraryName = `${options.owner}/${options.repo}`,
    toolName = `get_supported_releases_${libraryName.toLowerCase().replaceAll(/\s+/g, '_')}`,
    toolDescription = `Get the list of supported releases for ${libraryName}`,
    toolTitle = `Get Supported Releases for ${libraryName}`
  } = options;
  const logger = options.logger ?? new MCPLogger(toolName, options.logLevel);
  if (!githubToken) {
    logger.error?.(`Missing githubToken for ${toolName}`);
    return;
  }

  const octokit = new Octokit({ auth: githubToken });
  const supportedReleases = await getSupportedReleases(octokit, options, logger);

  server.registerTool(
    toolName,
    {
      title: toolTitle,
      description: toolDescription,
      outputSchema: {
        releases: z.array(z.string()).describe('List of supported releases')
      }
    },
    () => {
      return {
        content: [
          {
            type: 'text',
            text: `The supported releases for ${libraryName} are: \n${supportedReleases.map((r) => `  - ${r}`).join('\n')}`
          }
        ],
        structuredContent: {
          releases: supportedReleases
        }
      };
    }
  );
}
