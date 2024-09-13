/* eslint-disable @typescript-eslint/naming-convention */
import globals from 'globals';
import nxPlugin from '@nx/eslint-plugin';
import o3rConfig from '@o3r/eslint-config';
import o3rTemplate from '@o3r/eslint-config/template';
import jsonParser from 'jsonc-eslint-parser';

export default [
  ...o3rConfig.default,
  ...o3rTemplate.default,
  {
    name: '@o3r/ignores',
    ignores: [
      '.cache/**/*',
      '.yarn/**/*',
      '**/dist*/',
      '**/test/',
      '**/tmp/',
      '**/templates/',
      '**/generated-doc/',
      '**/packaged-action/',
      '.pnp.js',
      '.vscode',
      '**/src/**/package.json',
      '!.yarnrc.yml'
    ]
  },
  {
    name: '@o3r/report-unused-disable-directives',
    linterOptions: {
      reportUnusedDisableDirectives: 'error'
    }
  },
  {
    name: '@o3r/globals',
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.webextensions,
        globalThis: true
      },
      ecmaVersion: 12
    },
    settings: {
      'import/resolver': 'node'
    }
  },
  {
    name: '@o3r/jasmine',
    files: ['**/*{.,-}jasmine.ts'],
    rules: {
      'jest/no-jasmine-globals': 'off'
    },
    languageOptions: {
      globals: {
        ...globals.jasmine
      }
    }
  },
  {
    name: '@o3r/spec',
    files: ['**/*.spec.ts'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off' // required by Jest to mock the imports
    }
  },
  {
    name: '@o3r/json/parser',
    files: ['**/*.json'],
    languageOptions: {
      parser: jsonParser
    }
  },
  {
    name: '@o3r/package-json',
    files: ['package.json'],
    plugins: {
      '@nx': nxPlugin
    },
    rules: {
      '@nx/dependency-checks': [
        'error',
        {
          buildTargets: ['build', 'build-builders', 'compile', 'test'],
          checkObsoleteDependencies: false,
          checkVersionMismatches: false,
          ignoredDependencies: ['ora', '@o3r/test-helpers']
        }
      ]
    }
  },
  {
    name: '@o3r/eslint-config',
    files: ['**/eslint*.config.mjs'],
    rules: {
      'no-underscore-dangle': [
        'error',
        {
          allow: ['__filename', '__dirname']
        }
      ]
    }
  }
];
