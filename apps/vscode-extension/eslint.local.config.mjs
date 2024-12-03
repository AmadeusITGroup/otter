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
    name: '@o3r/vscode-extension/projects',
    languageOptions: {
      sourceType: 'module',
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: [
          'tsconfig.build.json',
          'tsconfig.eslint.json',
          'tsconfig.spec.json'
        ]
      }
    },
    settings: {
      'import/core-modules': ['vscode']
    }
  },
  {
    name: '@o3r/vscode-extension/globals',
    languageOptions: {
      globals: {
        ...globals.node
      }
    }
  },
  {
    name: '@o3r/vscode-extension/package-json-file',
    files: ['package.json'],
    rules: {
      '@nx/dependency-checks': ['error', {
        buildTargets: ['build', 'build-builders', 'compile', 'test'],
        checkObsoleteDependencies: false,
        checkVersionMismatches: false,
        ignoredDependencies: ['ora', '@o3r/test-helpers', '@o3r/schematics', '@o3r/eslint-plugin', '@typescript-eslint/utils'],
        ignoredFiles: ['**/*.spec.ts']
      }]
    }
  }
];
