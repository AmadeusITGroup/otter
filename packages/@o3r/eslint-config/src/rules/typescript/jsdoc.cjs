'use strict';
const jsdoc = require('eslint-plugin-jsdoc');
const { convertWarningsToErrors } = require('../utils.cjs');

/**
 * @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.ConfigArray}
 */
const config = [
  {
    name: '@o3r/eslint-config/jsdoc',
    files: [
      '**/*.{c,m,}{t,j}s'
    ],
    rules: {
      ...convertWarningsToErrors(jsdoc.configs['flat/recommended']),
      // TODO fix issue with ESLint v9+
      // 'jsdoc/check-examples': ['error', {
      //   'exampleCodeRegex': '^```(?:javascript|typescript|java|json|yaml|shell)?([\\s\\S]*)```\\s*$'
      // }],
      'jsdoc/check-tag-names': [
        'error',
        {
          definedTags: ['note', 'title', 'o3rRestrictionKey', 'o3rCategory', 'o3rCategories', 'o3rWidget', 'o3rWidgetParam', 'o3rRequired']
        }
      ],
      'jsdoc/no-defaults': 'off',
      'jsdoc/no-undefined-types': 'off',
      'jsdoc/require-description': 'error',
      'jsdoc/require-jsdoc': [
        'error',
        {
          publicOnly: true
        }
      ],
      'jsdoc/require-param-description': 'off',
      'jsdoc/require-param-type': 'off',
      'jsdoc/require-property-type': 'off',
      'jsdoc/require-returns': 'off',
      'jsdoc/require-returns-type': 'off'
    }
  },
  {
    name: '@o3r/eslint-config/jsdoc/js',
    files: ['**/*.{c,m,}js'],
    rules: {
      'jsdoc/require-param-type': 'error',
      'jsdoc/require-returns-description': 'off',
      'jsdoc/require-returns-type': 'error'
    }
  }
];

module.exports = config;
