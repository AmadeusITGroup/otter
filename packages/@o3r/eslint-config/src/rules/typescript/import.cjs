'use strict';
const importPlugin = require('eslint-plugin-import');
const { convertWarningsToErrors } = require('../utils.cjs');

const isYarnPnP = /\.pnp\.cjs/.test(process.env.NODE_OPTIONS || '');

/**
 * @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.ConfigArray}
 */
const config = [
  {
    name: '@o3r/eslint-config/import',
    files: [
      '**/*.{c,m,}{t,j}s'
    ],
    rules: {
      ...convertWarningsToErrors(importPlugin.flatConfigs.recommended),
      ...convertWarningsToErrors(importPlugin.flatConfigs.typescript),
      'import/first': 'error',
      'import/newline-after-import': 'error',
      'import/no-cycle': 'error',
      'import/no-unresolved': 'error',
      'import/order': ['error', {
        'newlines-between': 'never',
        alphabetize: { order: 'asc', caseInsensitive: true }
      }]
    },
    settings: {
      'import/external-module-folders': [
        isYarnPnP ? '.yarn' : 'node_modules'
      ]
    }
  }
];

module.exports = config;
