/* eslint-disable @typescript-eslint/naming-convention */
'use strict';

const globals = require('globals');
const nxPlugin = require('@nx/eslint-plugin');
const o3rConfig = require('@o3r/eslint-config');
const o3rPlugin = require('@o3r/eslint-plugin');
const typescriptParser = require('@typescript-eslint/parser');
const jsonParser = require('jsonc-eslint-parser');
const yamlParser = require('yaml-eslint-parser');

const globalSharedConfig = [
  ...o3rConfig.default,
  {
    name: '@o3r/ignores',
    ignores: [
      '**/node_modules/**/*',
      '.cache/**/*',
      '.yarn/**/*',
      '**/dist/',
      '**/test/',
      '**/tmp/',
      '**/generated-doc/',
      '\\{packages,apps}/@*/*/dist*/**/*',
      'packages/@*/*/**/templates/**/*',
      'apps/*/**/templates/**/*',
      '.pnp.js',
      '.vscode',
      'tools/github-actions/*/packaged-action/',
      '**/src/**/package.json',
      '!.yarnrc.yml'
    ]
  },
  {
    name: '@o3r/report-unused-disable-directives',
    linterOptions: {
      reportUnusedDisableDirectives: 'warn'
    }
  },
  {
    name: '@o3r/globals',
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.webextensions,
        ...globals.jasmine,
        ...globals.jest,
        globalThis: true
      },
      ecmaVersion: 12
    },
    settings: {
      'import/resolver': 'node'
    }
  },
  {
    name: '@o3r/typescript/parser',
    files: ['**/*.{c,m,}{t,j}s'],
    languageOptions: {
      parser: typescriptParser
    }
  },
  {
    name: '@o3r/jasmine',
    files: ['**/*{.,-}jasmine.ts'],
    rules: {
      'jest/no-jasmine-globals': 'off'
    }
  },
  {
    name: '@o3r/spec',
    files: ['**/*.spec.ts'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off'
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
    name: '@o3r/yaml/parser',
    files: ['**/*.y{a,}ml'],
    languageOptions: {
      parser: yamlParser
    }
  }
];

module.exports = [
  ...globalSharedConfig,
  {
    name: '@o3r/framework/projects',
    languageOptions: {
      sourceType: 'commonjs',
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: ['tsconfig.eslint.json']
      }
    }
  },
  {
    name: '@o3r/framework/yarnrc',
    files: ['**/.yarnrc.yml'],
    plugins: {
      '@o3r': o3rPlugin
    },
    rules: {
      '@o3r/yarnrc-package-extensions-harmonize': ['error']
    }
  },
  {
    name: '@o3r/package-json',
    files: ['**/package.json'],
    plugins: {
      '@o3r': o3rPlugin
    },
    rules: {
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
    name: '@o3r/framework/main-package-json',
    files: ['./package.json'],
    plugins: {
      '@o3r': o3rPlugin
    },
    rules: {
      '@o3r/json-dependency-versions-harmonize': [
        'error',
        {
          ignoredPackages: ['@o3r/build-helpers'],
          ignoredDependencies: ['npm'],
          alignPeerDependencies: false,
          alignEngines: true
        }
      ]
    }
  },
  {
    name: 'create/package-json-files',
    // Needs to be at the top level for the harmonize:version
    files: ['./packages/@{ama-sdk,o3r}/create/package.json'],
    rules: {
      '@o3r/json-dependency-versions-harmonize': ['error', {
        'ignoredPackages': ['@o3r/build-helpers'],
        ignoredDependencies: ['yarn'],
        'alignPeerDependencies': false
      }]
    }
  }
];

module.exports.globalSharedConfig = globalSharedConfig;
