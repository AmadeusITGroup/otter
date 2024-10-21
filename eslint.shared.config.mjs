import o3rTemplate from '@o3r/eslint-config/template';
import nxPlugin from '@nx/eslint-plugin';
import o3rConfig from '@o3r/eslint-config';
import o3rPlugin from '@o3r/eslint-plugin';
import globals from 'globals';
import jsonParser from 'jsonc-eslint-parser';

export default [
  ...o3rConfig,
  ...o3rTemplate,
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
      '**/src/**/package.json'
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
    name: '@o3r/parser/json',
    files: ['**/*.json'],
    languageOptions: {
      parser: jsonParser
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
    name: '@o3r/setup-jest',
    files: ['**/setup-jest.ts'],
    rules: {
      'unicorn/no-empty-file': 'off',
    }
  },
  {
    name: '@o3r/package-json',
    files: ['package.json'],
    plugins: {
      '@nx': nxPlugin,
      '@o3r': o3rPlugin
    },
    rules: {
      '@nx/dependency-checks': [
        'error',
        {
          buildTargets: ['build', 'build-builders', 'compile', 'test'],
          checkObsoleteDependencies: false,
          checkVersionMismatches: false,
          ignoredDependencies: ['ora', '@o3r/test-helpers'],
          ignoredFiles: ['**/*.spec.ts']
        }
      ],
      '@o3r/json-dependency-versions-harmonize': [
        'error',
        {
          ignoredPackages: ['@o3r/build-helpers'],
          alignPeerDependencies: false,
          alignEngines: true
        }
      ]
    }
  },
  {
    name: '@o3r/mjs-files',
    files: ['**/*.mjs'],
    rules: {
      'no-underscore-dangle': [
        'error',
        {
          allow: ['__filename', '__dirname']
        }
      ]
    }
  },
  {
    name: '@o3r/disabled-for-discussion',
    files: ['**/*'],
    rules: {
      '@stylistic/comma-dangle': 'off',
      '@stylistic/quote-props': 'off',
      'jsdoc/require-param-description': 'off'
    }
  }
];
