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
 * Register the best practices tool.
 * @param server
 * @param resourcesPath
 */
export async function registerBestPracticesTool(server: McpServer, resourcesPath: string): Promise<void> {
  const bestPracticesResourcesPath = join(resourcesPath, 'best-practices');

  server.registerTool(
    'get_best_practices',
    {
      title: 'Get Otter Coding Best Practices Guide',
      description: await readFile(
        join(bestPracticesResourcesPath, 'description'),
        { encoding: 'utf8' }
      ),
      annotations: {
        readOnlyHint: true,
        openWorldHint: false
      }
    },
    async () => {
      const bestPractices = await readFile(
        join(bestPracticesResourcesPath, 'output.md'),
        { encoding: 'utf8' }
      );
      const developer = await readFile(
        join(resourcesPath, 'developer.md'),
        { encoding: 'utf8' }
      );

      const text = [developer, bestPractices].join('\n\n');

      return { content: [{ type: 'text', text }] };
    }
  );
}
