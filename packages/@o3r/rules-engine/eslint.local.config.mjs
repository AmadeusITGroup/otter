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
    name: '@o3r/rules-engine/projects',
    languageOptions: {
      sourceType: 'module',
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: [
          'tsconfig.build.json',
          'tsconfig.fixture.jasmine.json',
          'tsconfig.fixture.jest.json',
          'tsconfig.builders.json',
          'tsconfig.spec.json',
          'tsconfig.eslint.json'
        ]
      }
    }
  },
  {
    name: '@o3r/rules-engine/test',
    files: ['**/*.spec.ts'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser
      }
    }
  }
];
