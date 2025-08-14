import {
  readFile,
} from 'node:fs/promises';
import {
  join,
} from 'node:path';
import type {
  McpServer,
} from '@modelcontextprotocol/sdk/server/mcp.js';

/**
 * Register resources for best practices
 * @param server
 * @param resourcesPath
 */
export async function registerBestPracticesResources(server: McpServer, resourcesPath: string): Promise<void> {
  const bestPracticesResourcesPath = join(resourcesPath, 'best-practices');
  const name = 'instructions';
  const uri = `${name}://best-practices`;
  server.registerResource(
    name,
    uri,
    {
      title: 'Otter Best Practices and Code Generation Guide',
      description: await readFile(
        join(bestPracticesResourcesPath, 'description.md'),
        { encoding: 'utf8' }
      ),
      mimeType: 'text/markdown'
    },
    async () => {
      const text = await readFile(
        join(bestPracticesResourcesPath, 'output.md'),
        { encoding: 'utf8' }
      );

      return { contents: [{ uri, text }] };
    }
  );
}
