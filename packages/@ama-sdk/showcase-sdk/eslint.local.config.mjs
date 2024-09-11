import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// eslint-disable-next-line no-underscore-dangle
const __filename = fileURLToPath(import.meta.url);
// __dirname is not defined in ES module scope
// eslint-disable-next-line no-underscore-dangle
const __dirname = dirname(__filename);

export default [
  {
    name: '@ama-sdk/schowcase-sdk/ignores',
    ignores: [
      'src/api',
      'src/models/base',
      'src/spec/api-mocks.ts',
      'src/spec/operation-adapter.ts',
      'dist',
      'build',
      'scripts',
      'jest.config.js',
      'eslint.config.js'
    ]
  },
  {
    name: '@ama-sdk/showcase-sdk/projects',
    languageOptions: {
      sourceType: 'module',
      ecmaVersion: 12,
      parserOptions: {
        extraFileExtensions: ['.json'],
        tsconfigRootDir: __dirname,
        project: [
          'tsconfig.eslint.json',
          'testing/tsconfig.spec.json',
          'tsconfigs/tsconfig.jasmine.json',
          'tsconfigs/tsconfig.jest.json',
          'tsconfigs/tsconfig.source.json'
        ]
      }
    }
  },
  {
    name: '@ama-sdk/showcase-sdk/typescript-files',
    files: ['**/*.ts'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/naming-convention': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      'max-len': 'off',
      'no-redeclare': 'off',
      'no-use-before-define': 'off',
      'no-useless-escape': 'off'
    }
  },
  {
    name: '@ama-sdk/showcase-sdk/jasmine-fixture-files',
    files: ['**/*.jasmine.fixture.ts', '**/*api.fixture.ts'],
    rules: {
      'jest/no-jasmine-globals': 'off'
    }
  },
  {
    name: '@ama-sdk/showcase-sdk/helper-files',
    files: ['**/*.helper.ts'],
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'error'
    }
  },
  {
    name: '@ama-sdk/showcase-sdk/javascript-files',
    files: ['**/*.js'],
    rules: {
      '@typescript-eslint/restrict-template-expressions': 'off'
    }
  }
];
