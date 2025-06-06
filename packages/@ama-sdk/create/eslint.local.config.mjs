import {
  dirname,
} from 'node:path';
import {
  fileURLToPath,
} from 'node:url';
import globals from 'globals';

const __filename = fileURLToPath(import.meta.url);
// __dirname is not defined in ES module scope
const __dirname = dirname(__filename);

export default [
  {
    name: '@ama-sdk/create/projects',
    languageOptions: {
      sourceType: 'module',
      parserOptions: {
        tsconfigRootDir: __dirname,
        projectService: true
      },
      globals: {
        ...globals.node
      }
    }
  },
  {
    name: '@ama-sdk/create/override',
    rules: {
      'no-console': 'off'
    }
  }
];
