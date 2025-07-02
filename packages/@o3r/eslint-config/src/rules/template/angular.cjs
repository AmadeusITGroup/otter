'use strict';
const angular = require('angular-eslint');
const { convertWarningsToErrors } = require('../utils.cjs');

/**
 * @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.ConfigArray}
 */
const config = [
  {
    name: '@o3r/eslint-config/eslint-comments',
    files: [
      '**/*.html'
    ],
    rules: {
      ...convertWarningsToErrors(angular.configs.templateRecommended),
      ...convertWarningsToErrors(angular.configs.templateAccessibility),
      '@angular-eslint/template/interactive-supports-focus': [
        'error',
        {
          allowList: ['ngbNavLink']
        }
      ]
    }
  }
];

module.exports = config;
