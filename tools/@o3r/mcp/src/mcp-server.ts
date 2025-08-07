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

  server.registerResource(
    'instructions',
    'instructions://best-practices',
    {
      title: 'Otter Best Practices and Code Generation Guide',
      description:
        "A comprehensive guide detailing Otter's best practices for code generation and development."
        + ' This guide should be used as a reference by an LLM to ensure any generated code'
        + ' adheres to modern Otter and Angular standards.',
      mimeType: 'text/markdown'
    },
    async () => {
      // Logging as error as recommended by modelcontextprotocol.io (https://modelcontextprotocol.io/quickstart/server#quick-examples-2)
      console.error('Fetching best practices guide...');
      const text = await readFile(
        join(__dirname, 'resources', 'instructions', 'best-practices.md'),
        'utf8'
      );
      // Logging as error as recommended by modelcontextprotocol.io (https://modelcontextprotocol.io/quickstart/server#quick-examples-2)
      console.error('Best practices guide fetched successfully.');

      return { contents: [{ uri: 'instructions://best-practices', text }] };
    }
  );

  registerBestPracticesTool(server);

  registerCreateMonorepoWithAppTool(server);

  return server;
}
