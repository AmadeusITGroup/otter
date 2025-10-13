import {
  readFile,
} from 'node:fs/promises';
import {
  join,
} from 'node:path';
import {
  McpServer,
} from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  registerBestPracticesToolAndResources as registerBestPractices,
} from './best-practices';
import {
  registerReleaseNotes,
} from './release-notes';
import {
  registerCreateMonorepoWithAppTool,
} from './tools/create-monorepo-with-app';
import {
  registerGetRepositoriesUsingOtterTool,
} from './tools/find-repositories-using-otter';
import {
  registerSupportedReleaseTool,
} from './tools/supported-releases';

/**
 * Create an MCP server instance.
 */
export async function createMcpServer(): Promise<McpServer> {
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

  await Promise.allSettled([
    registerReleaseNotes(server),
    registerBestPractices(server, resourcesPath),
    registerCreateMonorepoWithAppTool(server, resourcesPath),
    // eslint-disable-next-line @typescript-eslint/await-thenable -- Awaiting a non-promise value
    registerGetRepositoriesUsingOtterTool(server),
    registerSupportedReleaseTool(server)
  ]);
  return server;
}
