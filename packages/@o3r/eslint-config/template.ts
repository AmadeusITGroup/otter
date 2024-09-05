import type { TSESLint } from '@typescript-eslint/utils';
import * as o3r from '@o3r/eslint-plugin';
import angular from 'angular-eslint';
import o3rConfig from './rules/template/otter';

const config: TSESLint.FlatConfig.ConfigArray = [
  ...angular.configs.templateRecommended,
  ...o3rConfig(o3r)
];

export default config.map((subConfig) => ({
  ...subConfig,
  files: [
    ...(subConfig.files || []),
    '**/*.html'
  ]
}));
