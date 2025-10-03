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
  registerBestPracticesResources,
} from './instructions/best-practices';
import {
  registerBestPracticesTool,
} from './tools/best-practices';
import {
  registerCreateMonorepoWithAppTool,
} from './tools/create-monorepo-with-app';

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

  await registerBestPracticesResources(server, resourcesPath);
  await registerBestPracticesTool(server, resourcesPath);
  await registerCreateMonorepoWithAppTool(server, resourcesPath);

  return server;
}
