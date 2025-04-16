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
    name: '@o3r/yarn-errors-reporter-gh-action/projects',
    languageOptions: {
      sourceType: 'module',
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: [
          'tsconfig.build.json',
          'tsconfig.eslint.json'
        ]
      },
      globals: {
        ...globals.node
      }
    }
  },
  {
    name: '@o3r/yarn-errors-reporter-gh-action/ignores',
    ignores: [
      '**/packaged-action/**'
    ]
  }
];
