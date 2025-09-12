import {
  readFile,
} from 'node:fs/promises';
import {
  join,
} from 'node:path';
import type {
  McpServer,
} from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  z,
} from 'zod';

/**
 * Register the create monorepo with app tool.
 * @param server
 * @param resourcesPath
 */
export async function registerCreateMonorepoWithAppTool(server: McpServer, resourcesPath: string): Promise<void> {
  const resourcesCreatePath = join(resourcesPath, 'create');
  const createDescription = await readFile(join(resourcesCreatePath, 'description.md'), { encoding: 'utf8' });
  const repositoryNameDescription = await readFile(join(resourcesCreatePath, 'inputs', 'repository-name.md'), { encoding: 'utf8' });
  const applicationNameDescription = await readFile(join(resourcesCreatePath, 'inputs', 'application-name.md'), { encoding: 'utf8' });
  const createOutput = await readFile(join(resourcesCreatePath, 'output.md'), { encoding: 'utf8' });

  server.registerTool(
    'create_monorepo_with_app',
    {
      title: 'Create Monorepo with App',
      description: createDescription,
      inputSchema: {
        repositoryName: z.string().describe(repositoryNameDescription),
        applicationName: z.string().describe(applicationNameDescription).optional()
      }
    },
    ({ repositoryName, applicationName = 'frontend' }) => {
      return {
        content: [
          {
            type: 'text',
            text: createOutput
              .replaceAll('<repositoryName>', repositoryName)
              .replaceAll('<applicationName>', applicationName)
          }
        ]
      };
    }
  );
}
