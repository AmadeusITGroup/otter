const unicorn = require('eslint-plugin-unicorn');
const { convertWarningsToErrors } = require('../utils.cjs');

/**
 * @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.ConfigArray}
 */
const config = [
  {
    name: '@o3r/overrides/unicorn',
    files: [
      '**/*.{c,m,}{t,j}s'
    ],
    rules: {
      ...convertWarningsToErrors(unicorn.configs['flat/recommended']),
      'unicorn/catch-error-name': [
        'error',
        {
          ignore: [
            '^err'
          ]
        }
      ],
      'unicorn/filename-case': [
        'error',
        {
          case: 'kebabCase',
          ignore: [
            '^public_api.ts$'
          ]
        }
      ],
      'unicorn/import-style': 'off',
      'unicorn/no-array-for-each': 'off',
      'unicorn/no-array-reduce': 'off',
      'unicorn/no-null': 'off',
      'unicorn/no-typeof-undefined': 'off',
      'unicorn/prefer-dom-node-text-content': 'off',
      'unicorn/prefer-module': 'off',
      'unicorn/prefer-spread': 'off',
      'unicorn/prefer-string-raw': 'off',
      'unicorn/prefer-string-replace-all': 'off',
      'unicorn/prevent-abbreviations': 'off'
    }
  }
];

module.exports = config;
