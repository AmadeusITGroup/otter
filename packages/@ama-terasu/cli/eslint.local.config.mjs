import {
  dirname
} from 'node:path';
import {
  fileURLToPath
} from 'node:url';
import globals from 'globals';

const __filename = fileURLToPath(import.meta.url);
// __dirname is not defined in ES module scope
const __dirname = dirname(__filename);

export default [
  {
    name: '@ama-terasu/cli/projects',
    languageOptions: {
      sourceType: 'module',
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: [
          'tsconfig.build.json',
          'tsconfig.eslint.json',
          'tsconfig.spec.json'
        ]
      },
      globals: {
        ...globals.node
      }
    }
  },
  {
    name: '@ama-terasu/cli/override',
    rules: {
      'unicorn/no-process-exit': 'off'
    }
  }
];
