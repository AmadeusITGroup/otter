import {
  dirname
} from 'node:path';
import {
  fileURLToPath
} from 'node:url';

const __filename = fileURLToPath(import.meta.url);
// __dirname is not defined in ES module scope
const __dirname = dirname(__filename);

export default [
  {
    name: '@o3r/apis-manager/projects',
    languageOptions: {
      sourceType: 'module',
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: [
          'tsconfig.build.json',
          'tsconfig.spec.json',
          'tsconfig.builders.json',
          'tsconfig.eslint.json'
        ]
      }
    }
  },
  {
    name: '@o3r/it-tests',
    files: ['**/*.it.spec.ts'],
    rules: {
      'jsdoc/check-tag-names': [
        'error',
        {
          definedTags: ['jest-environment', 'jest-environment-o3r-app-folder', 'jest-environment-o3r-type']
        }
      ]
    }
  }
];
