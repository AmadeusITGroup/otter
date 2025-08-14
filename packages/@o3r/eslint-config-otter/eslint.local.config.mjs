import {
  dirname,
} from 'node:path';
import {
  fileURLToPath,
} from 'node:url';
import o3rPlugin from '@o3r/eslint-plugin';
import jsonParser from 'jsonc-eslint-parser';

const __filename = fileURLToPath(import.meta.url);
// __dirname is not defined in ES module scope
const __dirname = dirname(__filename);

export default [
  {
    name: '@o3r/eslint-config-otter/projects',
    languageOptions: {
      sourceType: 'module',
      parserOptions: {
        tsconfigRootDir: __dirname,
        projectService: true
      }
    }
  }, {
    name: '@o3r/eslint-config-otter/override',
    files: ['**/package.json'],
    languageOptions: {
      parser: jsonParser
    },
    plugins: {
      '@o3r': o3rPlugin
    },
    rules: {
      '@o3r/json-dependency-versions-harmonize': ['error', {
        ignoredDependencies: [
          'eslint-plugin-unicorn'
        ]
      }]
    }
  }
];
