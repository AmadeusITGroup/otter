import eslint from '@eslint/js';
import * as o3r from '@o3r/eslint-plugin';
import stylistic from '@stylistic/eslint-plugin';
import type { TSESLint } from '@typescript-eslint/utils';
import angular from 'angular-eslint';
import jsdoc from 'eslint-plugin-jsdoc';
import typescript from 'typescript-eslint';
import unicorn from 'eslint-plugin-unicorn';
import angularConfigOverrides from './typescript/eslint-angular.js';
import typescriptConfigOverrides from './typescript/eslint-typescript.js';
import eslintConfigOverrides from './typescript/eslint.js';
import jsdocConfigOverrides from './typescript/jsdoc.js';
import otterConfig from './typescript/otter.js';
import preferArrowConfig from './typescript/prefer-arrow.js';
import stylisticConfig from './typescript/stylistic.js';
import unicornConfig from './typescript/unicorn.js';

const getJestConfig = (type: 'recommended' | 'overrides'): TSESLint.FlatConfig.ConfigArray => {
  try {
    require.resolve('jest');
    return type === 'overrides'
      ? require('./rules/typescript/jest.js').default
      : [{
        // Name added for debugging purpose with @eslint/config-inspector
        name: 'jest/flat-recommended',
        files: [
          '**/*.{c,m,}{t,j}s'
        ],
        ...require('eslint-plugin-jest').configs['flat/recommended']
      }];
  }
  catch { return []; }
};

const configArray: TSESLint.FlatConfig.ConfigArray = [
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
  // All recommended first as the order has an importance
  ...eslintConfigOverrides,
  ...typescriptConfigOverrides,
  ...angularConfigOverrides,
  ...jsdocConfigOverrides,
  ...(getJestConfig('overrides')),
  ...preferArrowConfig,
  ...stylisticConfig,
  ...unicornConfig,
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

export default configArray;
