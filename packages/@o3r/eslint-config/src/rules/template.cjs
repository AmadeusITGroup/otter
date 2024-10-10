const o3r = require('@o3r/eslint-plugin');
const angular = require('angular-eslint');
const o3rConfig = require('./template/otter.cjs');

/**
 * @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.ConfigArray}
 */
const configArray = [
  ...angular.configs.templateRecommended.map((config) => ({
    files: ['**/*.html'],
    ...config
  })),
  ...angular.configs.templateAccessibility.map((config) => ({
    files: ['**/*.html'],
    ...config
  })),
  ...o3rConfig(o3r)
];

module.exports = configArray;
