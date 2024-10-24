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
      'unicorn/prefer-code-point': 'off',
      'unicorn/prefer-dom-node-text-content': 'off',
      'unicorn/prefer-module': 'off',
      'unicorn/prefer-spread': 'off',
      'unicorn/prefer-string-raw': 'off',
      'unicorn/prefer-string-replace-all': 'off',
      'unicorn/prevent-abbreviations': 'off',
      'unicorn/catch-error-name': 'off',
      'unicorn/no-useless-promise-resolve-reject': 'off',
      'unicorn/prefer-set-has': 'off',
      'unicorn/prefer-string-slice': 'off',
      'unicorn/prefer-top-level-await': 'off',
      'unicorn/prefer-type-error': 'off',
      'unicorn/no-useless-undefined': 'off',
      'unicorn/no-useless-switch-case': 'off' // Handled by `@typescript-eslint/switch-exhaustiveness-check`
    }
  }
];

module.exports = config;
