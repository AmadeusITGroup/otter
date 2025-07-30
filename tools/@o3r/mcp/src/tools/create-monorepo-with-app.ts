import type {
  McpServer,
} from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  z,
} from 'zod';

/**
 * Register the create monorepo with app tool.
 * @param server
 */
export function registerCreateMonorepoWithAppTool(server: McpServer): void {
  server.registerTool(
    'create_monorepo_with_app',
    {
      title: 'Create Monorepo with App',
      description:
        'You **MUST** use this tool to create a monorepo with an application inside.'
        + 'It is mandatory to follow this guide to ensure all code adheres to '
        + 'Otter standards. This is the first step for any Otter repository.',
      inputSchema: {
        repositoryName: z.string().describe('The name of the repository to create.'),
        applicationName: z.string().describe('The name of the application to create inside the monorepo.').optional()
      }
    },
    ({ repositoryName, applicationName }) => {
      return {
        content: [
          {
            type: 'text',
            text: 'To create a monorepo with an application, follow the steps outlined in the Otter documentation. \n'
              + `First run: npm create @o3r ${repositoryName}\n`
              + `Then run: cd ${repositoryName} && npm exec ng g application ${applicationName || 'frontend'}\n`
          }
        ]
      };
    }
  );
}
