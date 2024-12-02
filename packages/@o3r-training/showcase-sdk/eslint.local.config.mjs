import {
  dirname,
} from 'node:path';
import {
  fileURLToPath,
} from 'node:url';

const __filename = fileURLToPath(import.meta.url);
// __dirname is not defined in ES module scope
const __dirname = dirname(__filename);

export default [
  {
    name: '@o3r-training/showcase-sdk/ignores',
    ignores: [
      'src/api/',
      'src/models/base/',
      'src/spec/api-mock.ts',
      'src/spec/operation-adapter.ts'
    ]
  },
  {
    name: '@o3r-training/showcase-sdk/projects',
    languageOptions: {
      sourceType: 'module',
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: [
          'tsconfig.build.json',
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
    name: '@o3r-training/showcase-sdk/typescript-files',
    files: ['**/*.ts'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/naming-convention': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      'max-len': 'off',
      'no-redeclare': 'off',
      'no-use-before-define': 'off',
      'no-useless-escape': 'off',
      'import/export': 'off'
    }
  },
  {
    name: '@o3r-training/showcase-sdk/jasmine-fixture-files',
    files: ['**/*.jasmine.fixture.ts', '**/*api.fixture.ts'],
    rules: {
      'jest/no-jasmine-globals': 'off'
    }
  },
  {
    name: '@o3r-training/showcase-sdk/helper-files',
    files: ['**/*.helper.ts'],
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'error'
    }
  },
  {
    name: '@o3r-training/showcase-sdk/javascript-files',
    files: ['**/*.js'],
    rules: {
      '@typescript-eslint/restrict-template-expressions': 'off'
    }
  }
];
