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
    name: '@o3r/dynamic-content/projects',
    languageOptions: {
      sourceType: 'module',
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: [
          'tsconfig.build.json',
          'tsconfig.builders.json',
          'tsconfig.fixture.jasmine.json',
          'tsconfig.fixture.jest.json',
          'tsconfig.spec.json',
          'tsconfig.eslint.json'
        ]
      }
    },
    settings: {
      'import/core-modules': ['cheerio', 'express-interceptor']
    }
  },
  {
    name: '@o3r/dynamic-content/test',
    files: ['**/*.spec.ts'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser
      }
    }
  },
  {
    name: '@o3r/dynamic-content/middleware',
    files: ['**/middlewares/**'],
    languageOptions: {
      globals: {
        ...globals.node
      }
    }
  }
];
