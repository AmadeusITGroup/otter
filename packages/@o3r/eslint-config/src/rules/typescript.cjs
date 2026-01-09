'use strict';
const eslint = require('@eslint/js');
const comments = require('@eslint-community/eslint-plugin-eslint-comments/configs');
const o3r = require('@o3r/eslint-plugin');
const stylistic = require('@stylistic/eslint-plugin');
const angular = require('angular-eslint');
const importPlugin = require('eslint-plugin-import');
const jsdoc = require('eslint-plugin-jsdoc');
const unicorn = require('eslint-plugin-unicorn');
const globals = require('globals');
const typescript = require('typescript-eslint');
const commentsConfigOverrides = require('./typescript/comments.cjs');
const angularConfigOverrides = require('./typescript/eslint-angular.cjs');
const typescriptConfigOverrides = require('./typescript/eslint-typescript.cjs');
const eslintConfigOverrides = require('./typescript/eslint.cjs');
const importNewlinesConfig = require('./typescript/import-newlines.cjs');
const importConfig = require('./typescript/import.cjs');
const jsdocConfigOverrides = require('./typescript/jsdoc.cjs');
const otterConfig = require('./typescript/otter.cjs');
const preferArrowConfig = require('./typescript/prefer-arrow.cjs');
// TODO: reactivate once https://github.com/nirtamir2/eslint-plugin-sort-export-all/issues/18 is fixed
// const sortExportAll = require('./typescript/sort-export-all.cjs');
const stylisticConfig = require('./typescript/stylistic.cjs');
const unicornConfig = require('./typescript/unicorn.cjs');
const unusedImportsConfig = require('./typescript/unused-imports.cjs');

const checkDependency = (packageName) => {
  try {
    require.resolve(packageName);
  } catch {
    return false;
  }
  return true;
};

const hasPlaywrightInstalled = checkDependency('@playwright/test');

const hasJestDependency = checkDependency('jest');
const hasVitestDependency = checkDependency('vitest');

/**
 * @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.ConfigArray}
 */
const configArray = [
  {
    // Name added for debugging purpose with @eslint/config-inspector
    name: '@eslint/js/recommended',
    files: [
      '**/*.{c,m,}{t,j}s'
    ],
    ...eslint.configs.recommended
  },
  ...[
    ...typescript.configs.recommended,
    ...typescript.configs.recommendedTypeChecked,
    ...angular.configs.tsRecommended
  ].map((config) => ({
    // Same files as the ones asked by `typescript-eslint/eslint-recommended`
    files: ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts'],
    ...config
  })),
  {
    files: [
      '**/*.{c,m,}{t,j}s'
    ],
    ...jsdoc.configs['flat/recommended']
  },
  {
    // Name added for debugging purpose with @eslint/config-inspector
    name: 'stylistic/recommended',
    files: [
      '**/*.{c,m,}{t,j}s'
    ],
    ...stylistic.configs.recommended
  },
  {
    files: [
      '**/*.{c,m,}{t,j}s'
    ],
    ...unicorn.default.configs.recommended
  },
  ...(hasJestDependency
    ? [{
      // Name added for debugging purpose with @eslint/config-inspector
      name: 'jest/flat-recommended',
      files: [
        '**/*.{c,m,}{t,j}s'
      ],
      ...require('eslint-plugin-jest').configs['flat/recommended']
    }]
    : []
  ),
  {
    // Name added for debugging purpose with @eslint/config-inspector
    name: 'import/recommended',
    files: ['**/*.{c,m,}{t,j}s'],
    ...importPlugin.flatConfigs.recommended
  },
  {
    // Name added for debugging purpose with @eslint/config-inspector
    name: 'import/typescript',
    files: ['**/*.{c,m,}ts'],
    ...importPlugin.flatConfigs.typescript
  },
  comments.recommended,
  // All recommended first as the order has an importance
  ...eslintConfigOverrides,
  ...commentsConfigOverrides,
  ...typescriptConfigOverrides,
  ...angularConfigOverrides,
  ...jsdocConfigOverrides,
  ...(hasJestDependency
    ? require('./typescript/jest.cjs')
    : [{
      name: '@o3r/eslint-config/typescript/unit-test-globals',
      files: ['**/*.{c,m,}ts'],
      languageOptions: {
        globals: {
          ...hasVitestDependency ? globals.vitest : globals.jasmine
        }
      }
    }]
  ),
  ...preferArrowConfig,
  ...stylisticConfig,
  ...unicornConfig,
  ...importConfig,
  ...importNewlinesConfig,
  // TODO: reactivate once https://github.com/nirtamir2/eslint-plugin-sort-export-all/issues/18 is fixed
  // ...sortExportAll,
  ...unusedImportsConfig,
  ...otterConfig(o3r),
  {
    name: '@o3r/eslint-config/typescript/language-options',
    files: [
      '**/*.{c,m,}{t,j}s'
    ],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          modules: true,
          jsx: false
        }
      }
    }
  }, {
    name: '@o3r/eslint-config/node-files',
    files: [
      '**/schematics/**/*.{j,t}s',
      ...hasJestDependency ? ['**/jest.config.{c,m,}{j,t}s'] : []
    ],
    languageOptions: {
      globals: {
        ...globals.node,
        NodeJS: true
      }
    }
  },
  ...hasPlaywrightInstalled
    ? [{
      name: '@o3r/eslint-config/e2e-playwright',
      files: [
        '**/e2e-playwright/**/*.{j,t}s'
      ],
      languageOptions: {
        globals: {
          ...globals.node,
          NodeJS: true
        }
      }
    }]
    : []
];

module.exports = configArray;
