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
    name: '@o3r/eslint-config-otter/projects',
    languageOptions: {
      sourceType: 'module',
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: [
          'tsconfig.builders.json',
          'tsconfig.eslint.json',
          'tsconfig.spec.json'
        ]
      }
    }
  },
  {
    name: '@o3r/eslint-config-otter/overrides',
    files: ['package.json'],
    rules: {
      '@o3r/json-dependency-versions-harmonize': [
        'error',
        {
          // TODO should be removed in Otter v12
          ignoredDependencies: [
            'eslint',
            '@typescript-eslint/eslint-plugin',
            '@typescript-eslint/parser',
            '@typescript-eslint/utils',
            'eslint-plugin-jsdoc',
            'eslint-plugin-unicorn'
          ],
          ignoredPackages: [
            '@o3r/build-helpers',
            '@o3r/workspace-helpers'
          ],
          alignPeerDependencies: false,
          alignEngines: true
        }
      ]
    }
  }
];
