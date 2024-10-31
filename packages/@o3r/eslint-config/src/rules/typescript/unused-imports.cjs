'use strict';
const unusedImportsPlugin = require('eslint-plugin-unused-imports');

/** @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.ConfigArray} */
const config = [
  {
    name: '@o3r/eslint-config/unused-imports',
    files: [
      '**/*.{c,m,}{t,j}s'
    ],
    plugins: {
      'unused-imports': unusedImportsPlugin
    },
    rules: {
      'unused-imports/no-unused-imports': 'error'
    }
  }
];

module.exports = config;
