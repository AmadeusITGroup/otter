import {
  OPENAPI_NPM_KEYWORDS,
  // eslint-disable-next-line import/no-unresolved -- this import is valid, but eslint doesn't resolve it correctly due to mjs format
} from '@ama-openapi/core';
import type {
  McpServer,
} from '@modelcontextprotocol/sdk/server/mcp';
import {
  z,
} from 'zod';

/**
 * A tool to add an external model as a dependency from a library package.
 * Provides instructions on how to install the package and register the model in the OpenAPI manifest.
 * @param server The MCP server instance.
 */
export const addDependencyModel = (server: McpServer) => {
  server.registerTool('add_dependency_model', {
    title: 'Add an external model as a dependency to an OpenAPI project',
    description: `Provides instructions on how to add an external OpenAPI model from a library package as a dependency.
      Includes npm/yarn installation commands and guidance on registering the model in the openapi.manifest.json file.`,
    inputSchema: {
      modelName: z.string().describe('The name of the model included in the library we want to add as dependency.'),
      libraryName: z.string().optional().describe('The name of the library we want to add as dependency.'),
      version: z.string().optional().describe('The version of the dependency to add.')
    }
  }, (input) => {
    const { modelName, version } = input;
    let { libraryName } = input;
    const packageName = libraryName ? `${libraryName}${version ? `@~${version}` : ''}` : '';
    const isLibraryNameGiven = !!libraryName;

    libraryName ||= '<discovered library name>';

    const searchModelInLibraryInstructions = `The model file can be identified by its filename (matching the model name) `
      + `or by finding it in a components/schemas/ directory within a JSON or YAML file.`;

    return {
      content: [
        {
          type: 'text',
          text: isLibraryNameGiven
            ? (`Add the dependency "${libraryName}" to package.json if it is not already present.`
              + (version ? ` If the dependency already exists, verify that version ${version} is included in the current version range.` : '')
              + ` To add or update the dependency, run: "npm install ${packageName}" (or "yarn add ${packageName}" if using Yarn).`)

            : (`To find the library containing the model "${modelName}", inspect installed NPM packages that have one of these keywords: `
              + OPENAPI_NPM_KEYWORDS.map((keyword) => `"${keyword}"`).join(', ') + '. '
              + `${searchModelInLibraryInstructions} `
              + `Once you determine the library name, use "${libraryName}" as a placeholder in the following instructions.`)
        },
        {
          type: 'text',
          text: `After ensuring the dependency is installed, locate the model "${modelName}" in node_modules/${libraryName}. `
            + `${searchModelInLibraryInstructions} `
            + `Then register this model in "openapi.manifest.json" (or "openapi.manifest.yaml") under the "models" section using this structure: `
            + `models.${libraryName} = { path: "<relative path from node_modules to the model file, including inner-path if needed>" }`
        }
      ]
    };
  });
};
