import eslint from '@eslint/js';
import * as o3r from '@o3r/eslint-plugin';
import type { TSESLint } from '@typescript-eslint/utils';
import angular from 'angular-eslint';
import jsdoc from 'eslint-plugin-jsdoc';
import typescript from 'typescript-eslint';
import angularConfigOverrides from './rules/typescript/eslint-angular.js';
import typescriptConfigOverrides from './rules/typescript/eslint-typescript.js';
import eslintConfigOverrides from './rules/typescript/eslint.js';
import jsdocConfigOverrides from './rules/typescript/jsdoc.js';
import otterConfig from './rules/typescript/otter.js';
import preferArrowConfig from './rules/typescript/prefer-arrow.js';
import stylisticConfig from './rules/typescript/stylistic.js';
import unicornConfig from './rules/typescript/unicorn.js';

const getJestConfig = (type: 'recommended' | 'overrides'): TSESLint.FlatConfig.ConfigArray => {
  try {
    if (require.resolve('jest')) {
      return type === 'overrides'
        ? require('./rules/typescript/jest.js').default
        : [require('eslint-plugin-jest').configs['flat/recommended']];
    }
    return [];
  }
  catch { return []; }
};

const config: TSESLint.FlatConfig.ConfigArray = [
  {
    // Name added for debugging purpose with @eslint/config-inspector
    name: '@eslint/js/recommended',
    ...eslint.configs.recommended
  },
  ...typescript.configs.recommended,
  ...typescript.configs.recommendedTypeChecked,
  ...angular.configs.tsRecommended,
  jsdoc.configs['flat/recommended'],
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

export default config.map((subConfig) => ({
  ...subConfig,
  files: [
    ...(subConfig.files || []),
    '**/*.{c,m,}{t,j}s'
  ]}));
