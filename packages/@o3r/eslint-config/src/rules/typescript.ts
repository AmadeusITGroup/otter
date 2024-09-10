import eslint from '@eslint/js';
import * as o3r from '@o3r/eslint-plugin';
import type { TSESLint } from '@typescript-eslint/utils';
import angular from 'angular-eslint';
import jsdoc from 'eslint-plugin-jsdoc';
import typescript from 'typescript-eslint';
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
        ...require('eslint-plugin-jest').configs['flat/recommended']
      }];
  }
  catch { return []; }
};

const config: TSESLint.FlatConfig.ConfigArray = [
  {
    // Name added for debugging purpose with @eslint/config-inspector
    name: '@eslint/js/recommended',
    ...eslint.configs.recommended
  },
  // TODO remove the `as any` once migrate @typescript-eslint/utils to v8
  ...typescript.configs.recommended as any,
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

export default config;
