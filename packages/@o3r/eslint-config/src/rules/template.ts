import type { TSESLint } from '@typescript-eslint/utils';
import * as o3r from '@o3r/eslint-plugin';
import angular from 'angular-eslint';
import o3rConfig from './template/otter';

const config: TSESLint.FlatConfig.ConfigArray = [
  ...angular.configs.templateRecommended,
  ...o3rConfig(o3r)
];

export default config;
