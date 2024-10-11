const eslint = require('@eslint/js');
const o3r = require('@o3r/eslint-plugin');
const stylistic = require('@stylistic/eslint-plugin');
const angular = require('angular-eslint');
const importPlugin = require('eslint-plugin-import');
const jsdoc = require('eslint-plugin-jsdoc');
const unicorn = require('eslint-plugin-unicorn');
const typescript = require('typescript-eslint');
const angularConfigOverrides = require('./typescript/eslint-angular.cjs');
const typescriptConfigOverrides = require('./typescript/eslint-typescript.cjs');
const eslintConfigOverrides = require('./typescript/eslint.cjs');
const importNewlinesConfig = require('./typescript/import-newlines.cjs');
const importConfig = require('./typescript/import.cjs');
const jsdocConfigOverrides = require('./typescript/jsdoc.cjs');
const otterConfig = require('./typescript/otter.cjs');
const preferArrowConfig = require('./typescript/prefer-arrow.cjs');
const sortExportAll = require('./typescript/sort-export-all.cjs');
const stylisticConfig = require('./typescript/stylistic.cjs');
const unicornConfig = require('./typescript/unicorn.cjs');
const unusedImportsConfig = require('./typescript/unused-imports.cjs');

/**
 * Get the jest config if dependency is present
 * @param {'recommended' | 'overrides'} type
 * @returns {import('@typescript-eslint/utils').TSESLint.FlatConfig.ConfigArray}
 */
const getJestConfig = (type) => {
  try {
    require.resolve('jest');
    return type === 'overrides'
      ? require('./typescript/jest.cjs')
      : [{
        // Name added for debugging purpose with @eslint/config-inspector
        name: 'jest/flat-recommended',
        files: [
          '**/*.{c,m,}{t,j}s'
        ],
        ...require('eslint-plugin-jest').configs['flat/recommended']
      }];
  } catch {
    return [];
  }
};

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
    ...stylistic.configs['recommended-flat']
  },
  {
    files: [
      '**/*.{c,m,}{t,j}s'
    ],
    ...unicorn.configs['flat/recommended']
  },
  ...(getJestConfig('recommended')),
  {
    // Name added for debugging purpose with @eslint/config-inspector
    name: 'import/recommended',
    ...importPlugin.flatConfigs.recommended
  },
  {
    // Name added for debugging purpose with @eslint/config-inspector
    name: 'import/typescript',
    ...importPlugin.flatConfigs.typescript
  },
  // All recommended first as the order has an importance
  ...eslintConfigOverrides,
  ...typescriptConfigOverrides,
  ...angularConfigOverrides,
  ...jsdocConfigOverrides,
  ...(getJestConfig('overrides')),
  ...preferArrowConfig,
  ...stylisticConfig,
  ...unicornConfig,
  ...importConfig,
  ...importNewlinesConfig,
  ...sortExportAll,
  ...unusedImportsConfig,
  ...otterConfig(o3r),
  {
    name: '@o3r/typescript/language-options',
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
  }
];

module.exports = configArray;
