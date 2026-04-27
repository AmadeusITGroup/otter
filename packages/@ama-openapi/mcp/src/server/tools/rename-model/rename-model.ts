import type {
  McpServer,
} from '@modelcontextprotocol/sdk/server/mcp';
import {
  z,
} from 'zod';

export const renameModel = (server: McpServer) => {
  server.registerTool('rename_model', {
    title: 'Rename an OpenAPI model',
    description: `Provides instructions on how to rename an OpenAPI model in your project.
      Returns guidance on updating the transforms.rename field in the openapi.manifest.json file.`,
    inputSchema: {
      libraryName: z.string().optional().describe('The name of the library where the model is located.'),
      currentName: z.string().describe('The current name of the OpenAPI model.'),
      newName: z.string().describe('The new name for the OpenAPI model.')
    }
  }, (input) => {
    const { currentName, newName, libraryName } = input;

    return {
      content: [
        {
          type: 'text',
          text: `To rename the OpenAPI model from "${currentName}" to "${newName}", you can follow these steps:
          1. Locate the model "${currentName}" in the file "openapi.manifest.json" (or "openapi.manifest.yaml") under the "${libraryName ? `models.${libraryName}` : 'models'}" section.
          2. Add the field "transforms.rename" with the value "${newName}" to the model object.`
        }
      ]
    };
  });
};
