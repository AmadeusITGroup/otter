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
    name: '@o3r/mobile/projects',
    languageOptions: {
      sourceType: 'module',
      parserOptions: {
        tsconfigRootDir: __dirname,
        projectService: true
      }
    }
  },
  {
    name: '@o3r/mobile/pcloudy',
    files: ['**/pcloudy/**'],
    languageOptions: {
      globals: {
        ...globals.node
      }
    }
  }
];
