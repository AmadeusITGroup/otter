import {
  dirname,
} from 'node:path';
import {
  fileURLToPath,
} from 'node:url';
import {
  ignoreFilesWithGitAttribute,
} from '@o3r/eslint-config/helpers';

const __filename = fileURLToPath(import.meta.url);
// __dirname is not defined in ES module scope
const __dirname = dirname(__filename);

export default [
  ignoreFilesWithGitAttribute(fileURLToPath(new URL('.gitattributes', import.meta.url)), 'linguist-generated'),
  {
    name: '@o3r-training/showcase-sdk/projects',
    languageOptions: {
      sourceType: 'module',
      parserOptions: {
        tsconfigRootDir: __dirname,
        projectService: true
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
