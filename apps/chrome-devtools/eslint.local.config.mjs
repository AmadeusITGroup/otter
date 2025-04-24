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
    name: '@o3r/chrome-devtools/ignores',
    ignores: [
      'playwright-reports/**/*',
      'test-results/**/*'
    ]
  },
  {
    name: '@o3r/chrome-devtools/projects',
    languageOptions: {
      sourceType: 'module',
      parserOptions: {
        tsconfigRootDir: __dirname,
        projectService: true
      }
    }
  },
  {
    name: '@o3r/chrome-devtools/globals',
    languageOptions: {
      globals: {
        ...globals.webextensions,
        globalThis: true
      }
    }
  },
  {
    name: '@o3r/chrome-devtools/local',
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off'
    }
  },
  {
    name: '@o3r/chrome-devtools/playwright',
    files: ['**/e2e-playwright/**'],
    languageOptions: {
      globals: {
        ...globals.node
      }
    }
  }
];
