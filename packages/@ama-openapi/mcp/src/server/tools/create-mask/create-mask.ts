import type {
  McpServer,
} from '@modelcontextprotocol/sdk/server/mcp';
import {
  z,
} from 'zod';

/**
 * A tool to create a field mask for an OpenAPI model.
 * Provides instructions on how to configure the transforms.masks section in the OpenAPI manifest to expose only specific fields.
 * @param server The MCP server instance.
 */
export const createMask = (server: McpServer) => {
  server.registerTool('create_mask', {
    title: 'Create a field mask for an OpenAPI model',
    description: `Provides instructions on how to create a field mask for an OpenAPI model in your project.
      A mask limits the model to specific fields. Returns guidance on updating the transforms.masks section in the openapi.manifest.json file.`,
    inputSchema: {
      modelName: z.string().describe('The name of the OpenAPI model to create a mask for.'),
      libraryName: z.string().describe('The name of the library we want to add as dependency.'),
      fields: z.array(z.string()).describe('The list of fields to include in the mask.')
    }
  }, (input) => {
    const { modelName, libraryName, fields } = input;

    return {
      content: [
        {
          type: 'text',
          text: `To create a mask for the OpenAPI model "${modelName}" with the specified fields, you can follow these steps:
          1. Locate the model "${modelName}" in the file "openapi.manifest.json" (or "openapi.manifest.yaml") under the "${libraryName ? `models.${libraryName}` : 'models'}" section.
          2. Add a new entry under the "transforms.masks" section of the model object with the masked fields: ${fields.map((field) => `"${field}"`).join(', ')}.
             A mask is structured as following: it contains the same structure as the original model but only with the fields included in the mask, these fields should have the value "true".
             For example:
             "transforms": {
               "masks": {
                 "properties": {
                   "field1": true,
                   "field2": true
                 }
               }
             }`
        }
      ]
    };
  });
};
