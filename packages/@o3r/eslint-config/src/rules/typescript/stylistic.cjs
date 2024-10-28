const stylistic = require('@stylistic/eslint-plugin');
const { convertWarningsToErrors } = require('../utils.cjs');

/**
 * @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.ConfigArray}
 */
const config = [
  {
    name: '@o3r/eslint-config/stylistic',
    files: [
      '**/*.{c,m,}{t,j}s'
    ],
    rules: {
      ...convertWarningsToErrors(stylistic.configs['recommended-flat']),
      '@stylistic/arrow-parens': ['error', 'always'],
      '@stylistic/brace-style': ['error', '1tbs'],
      '@stylistic/indent': [
        'error',
        2,
        {
          FunctionDeclaration: {
            parameters: 'off'
          },
          SwitchCase: 1
        }
      ],
      '@stylistic/key-spacing': [
        'error',
        {
          beforeColon: false,
          afterColon: true
        }
      ],
      '@stylistic/keyword-spacing': 'error',
      '@stylistic/linebreak-style': [
        'error',
        'unix'
      ],
      '@stylistic/max-len': [
        'error',
        {
          code: 200
        }
      ],
      '@stylistic/member-delimiter-style': [
        'error',
        {
          multiline: {
            delimiter: 'semi',
            requireLast: true
          },
          singleline: {
            delimiter: 'semi',
            requireLast: false
          }
        }
      ],
      '@stylistic/no-extra-semi': 'error',
      '@stylistic/no-multiple-empty-lines': 'error',
      '@stylistic/quotes': [
        'error',
        'single',
        {
          avoidEscape: true,
          allowTemplateLiterals: true
        }
      ],
      '@stylistic/semi': [
        'error',
        'always'
      ],
      '@stylistic/semi-spacing': [
        'error',
        {
          before: false,
          after: true
        }
      ],
      '@stylistic/space-unary-ops': 'error',
      '@stylistic/spaced-comment': [
        'error',
        'always',
        {
          markers: [
            '/'
          ]
        }
      ],
      '@stylistic/wrap-iife': [
        'error',
        'inside'
      ],
      '@stylistic/operator-linebreak': [
        'error',
        'before',
        {
          'overrides': { '=': 'none' }
        }
      ]
    }
  }
];

module.exports = config;