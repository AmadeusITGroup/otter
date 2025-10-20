import {
  readFile,
} from 'node:fs/promises';
import {
  join,
  resolve,
} from 'node:path';
import type {
  MCPLogger,
} from '@ama-mcp/core';
import {
  registerGetRepositoriesUsingLibraryTool,
  registerReleaseNotes,
  registerSupportedReleasesTool,
} from '@ama-mcp/github';
import {
  McpServer,
} from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  registerBestPracticesToolAndResources,
} from './best-practices';
import {
  registerCreateMonorepoWithAppTool,
} from './create-monorepo-with-app';
import {
  libraryName,
  OTTER_SCOPES,
  owner,
  repo,
  uriPrefix,
} from './utils/otter';

/**
 * Create an MCP server instance.
 * @param logger
 */
export async function createMcpServer(logger: MCPLogger): Promise<McpServer> {
  const { name, version } = JSON.parse(await readFile(join(__dirname, '..', 'package.json'), 'utf8')) as { name: string; version: string };
  const server = new McpServer({
    name,
    version,
    capabilities: {
      resources: {},
      tools: {}
    }
  });
  const resourcesPath = join(__dirname, '..', 'resources');
  const githubToken = process.env.O3R_MCP_GITHUB_TOKEN;
  const cachePath = resolve(process.env.O3R_MCP_CACHE_PATH || '.cache/@o3r/mcp', 'repos-using-otter.json');

  await Promise.allSettled([
    registerBestPracticesToolAndResources(server, resourcesPath),
    registerCreateMonorepoWithAppTool(server, resourcesPath),
    ...(githubToken
      ? [
        registerGetRepositoriesUsingLibraryTool(server, {
          libraryName,
          scopes: OTTER_SCOPES,
          githubToken,
          cachePath,
          cacheMaxAge: Number.isNaN(process.env.O3R_MCP_CACHE_MAX_AGE) ? undefined : +(process.env.O3R_MCP_CACHE_MAX_AGE!)
        }),
        registerSupportedReleasesTool(server, {
          githubToken,
          owner,
          repo,
          libraryName
        }),
        registerReleaseNotes(server, {
          githubToken,
          owner,
          repo,
          libraryName,
          uriPrefix
        })
      ]
      : [
        () => logger.error('Missing O3R_MCP_GITHUB_TOKEN environment variable for github tools')
      ])
  ]);
  return server;
}
