import type {
  McpServer,
} from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  z,
} from 'zod';

/**
 * A tool to create a new OpenAPI specification project.
 * Provides the npm create command to initialize a new project with predefined structure and configuration.
 * @param server The MCP server instance.
 */
export const createProject = (server: McpServer) => {
  server.registerTool('create_openapi_project', {
    title: 'Create a new OpenAPI specification project',
    description: 'Provides the command to create a new OpenAPI specification project using npm create @ama-openapi with a predefined structure and configuration.',
    inputSchema: {
      projectName: z.string()
        .describe('The name of the OpenAPI project to create.')
        .transform((name) => name.trim().toLowerCase().replaceAll(/\s+/g, '-'))
        .refine((name) => {
          if (name.length === 0) {
            throw new Error('Project name cannot be empty.');
          }
          if (!/^@?[a-z0-9-]+(?:\/[a-z0-9-]+)?$/.test(name)) {
            throw new Error('Project name must be a valid npm package name (lowercase letters, numbers, hyphens, and optionally a scope).');
          }
          return true;
        })
    }
  }, (input) => {
    const { projectName } = input;
    return {
      content: [
        {
          type: 'text',
          text: `To create a new OpenAPI project named "${projectName}", you can run the following command in your terminal:
          npm create @ama-openapi ${projectName}`
        }
      ]
    };
  });
};
