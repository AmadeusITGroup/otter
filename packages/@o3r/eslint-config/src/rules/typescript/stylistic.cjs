'use strict';
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
      '@stylistic/comma-dangle': ['error', {
        arrays: 'never',
        objects: 'never',
        imports: 'always-multiline',
        exports: 'always-multiline',
        functions: 'never'
      }],
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
      '@stylistic/operator-linebreak': [
        'error',
        'before',
        {
          overrides: { '=': 'none' }
        }
      ],
      '@stylistic/quotes': [
        'error',
        'single',
        {
          avoidEscape: true,
          allowTemplateLiterals: true
        }
      ],
      '@stylistic/quote-props': [
        'error',
        'as-needed'
      ],
      '@stylistic/semi': [
        'error',
        'always'
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
      ]
    }
  }
];

module.exports = config;
