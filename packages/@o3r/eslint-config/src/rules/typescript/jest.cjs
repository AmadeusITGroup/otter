'use strict';
const jest = require('eslint-plugin-jest');
const { convertWarningsToErrors } = require('../utils.cjs');

/**
 * @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.ConfigArray}
 */
const config = [
  {
    name: '@o3r/eslint-config/jest',
    files: [
      '**/*.{c,m,}{t,j}s'
    ],
    rules: {
      ...convertWarningsToErrors(jest.configs['flat/recommended']),
      'jest/expect-expect': [
        'error',
        {
          assertFunctionNames: ['expect', 'expectObservable']
        }
      ]
    }
  }
];

module.exports = config;
