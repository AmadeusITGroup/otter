import {
  dirname
} from 'node:path';
import {
  fileURLToPath
} from 'node:url';
import globals from 'globals';

const __filename = fileURLToPath(import.meta.url);
// __dirname is not defined in ES module scope
const __dirname = dirname(__filename);

export default [
  {
    name: '@o3r/chrome-devtools/projects',
    languageOptions: {
      sourceType: 'module',
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: [
          'tsconfig.build.json',
          'tsconfig.spec.json',
          'tsconfig.extension.json',
          'tsconfig.eslint.json'
        ]
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
  }
];
