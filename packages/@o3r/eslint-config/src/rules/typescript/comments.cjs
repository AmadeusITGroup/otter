const comments = require('@eslint-community/eslint-plugin-eslint-comments/configs');
const { convertWarningsToErrors } = require('../utils.cjs');

/**
 * @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.ConfigArray}
 */
const config = [
  {
    name: '@o3r/eslint-config/eslint-comments',
    files: [
      '**/*.{c,m,}{t,j}s'
    ],
    rules: {
      ...convertWarningsToErrors(comments.recommended),
      '@eslint-community/eslint-comments/require-description': [
        'error',
        {
          ignore: ['eslint-enable']
        }
      ],
      '@eslint-community/eslint-comments/disable-enable-pair': 'off'
    }
  }
];

module.exports = config;
