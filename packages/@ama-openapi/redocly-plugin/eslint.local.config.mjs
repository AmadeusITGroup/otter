import {
  dirname,
} from 'node:path';
import {
  fileURLToPath,
} from 'node:url';
import globals from 'globals';

const __filename = fileURLToPath(import.meta.url);
// __dirname is not defined in ES module scope
export const __dirname = dirname(__filename);

export default [
  {
    name: '@ama-openapi/core/projects',
    languageOptions: {
      sourceType: 'module',
      parserOptions: {
        EXPERIMENTAL_useSourceOfProjectReferenceRedirect: true,
        tsconfigRootDir: __dirname,
        projectService: true
      }
    }
  },
  {
    name: '@ama-openapi/core/globals',
    languageOptions: {
      sourceType: 'module',
      globals: {
        ...globals.node,
        NodeJS: true
      }
    }
  }
];
