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
 */
export function registerBestPracticesTool(server: McpServer): void {
  server.registerTool(
    'get_best_practices',
    {
      title: 'Get Otter Coding Best Practices Guide',
      description:
        'You **MUST** use this tool to retrieve the Otter Best Practices Guide '
        + 'before any interaction with Otter and Angular code (creating, analyzing, modifying). '
        + 'It is mandatory to follow this guide to ensure all code adheres to '
        + 'modern standards. This is the first step for any Otter task.',
      annotations: {
        readOnlyHint: true,
        openWorldHint: false
      }
    },
    async () => {
      // Logging as error as recommended by modelcontextprotocol.io (https://modelcontextprotocol.io/quickstart/server#quick-examples-2)
      console.error('Fetching best practices guide...');
      const text = await readFile(
        join(__dirname, '..', 'resources', 'instructions', 'best-practices.md'),
        'utf8'
      );
      // Logging as error as recommended by modelcontextprotocol.io (https://modelcontextprotocol.io/quickstart/server#quick-examples-2)
      console.error('Best practices guide fetched successfully.');

      return {
        content: [
          {
            type: 'text',
            text
          }
        ]
      };
    }
  );
}
