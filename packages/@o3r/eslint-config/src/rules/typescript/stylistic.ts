/* eslint-disable @typescript-eslint/naming-convention */
import type { TSESLint } from '@typescript-eslint/utils';
import stylisticJs from '@stylistic/eslint-plugin-js';
import stylisticTs from '@stylistic/eslint-plugin-ts';

const config: TSESLint.FlatConfig.ConfigArray = [
  {
    name: '@o3r/overrides/stylistic-js',
    files: [
      '**/*.{c,m,}{t,j}s'
    ],
    plugins: {
      '@stylistic/js': stylisticJs
    },
    rules: {
      '@stylistic/js/comma-dangle': 'error',
      '@stylistic/js/comma-style': [
        'error',
        'last'
      ],
      '@stylistic/js/dot-location': [
        'error',
        'property'
      ],
      '@stylistic/js/eol-last': 'error',
      '@stylistic/js/indent': [
        'error',
        2,
        {
          'FunctionDeclaration': {
            'parameters': 'off'
          },
          'SwitchCase': 1
        }
      ],
      '@stylistic/js/key-spacing': [
        'warn',
        {
          'beforeColon': false,
          'afterColon': true
        }
      ],
      '@stylistic/js/linebreak-style': [
        'error',
        'unix'
      ],
      '@stylistic/js/max-len': [
        'error',
        {
          'code': 200
        }
      ],
      '@stylistic/js/new-parens': 'error',
      '@stylistic/js/no-mixed-spaces-and-tabs': 'error',
      '@stylistic/js/no-multi-spaces': 'error',
      '@stylistic/js/no-multiple-empty-lines': 'off',
      '@stylistic/js/no-trailing-spaces': 'error',
      '@stylistic/js/quotes': [
        'error',
        'single',
        {
          'allowTemplateLiterals': true
        }
      ],
      '@stylistic/js/semi': [
        'error',
        'always'
      ],
      '@stylistic/js/semi-spacing': [
        'warn',
        {
          'before': false,
          'after': true
        }
      ],
      '@stylistic/js/space-in-parens': [
        'error',
        'never'
      ],
      '@stylistic/js/space-unary-ops': 'warn',
      '@stylistic/js/spaced-comment': [
        'error',
        'always',
        {
          'markers': [
            '/'
          ]
        }
      ],
      '@stylistic/js/wrap-iife': [
        'error',
        'inside'
      ]
    }
  },
  {
    name: '@o3r/overrides/stylistic-ts',
    plugins: {
      '@stylistic/ts': stylisticTs
    },
    rules: {
      '@stylistic/ts/key-spacing': [
        'warn',
        {
          'beforeColon': false,
          'afterColon': true
        }
      ],
      '@stylistic/ts/keyword-spacing': 'error',
      '@stylistic/ts/semi': [
        'error',
        'always'
      ],
      '@stylistic/ts/space-infix-ops': 'error',
      '@stylistic/ts/no-extra-semi': 'error',
      '@stylistic/ts/space-before-function-paren': [
        'error',
        {
          'anonymous': 'always',
          'named': 'never',
          'asyncArrow': 'always'
        }
      ],
      '@stylistic/ts/quotes': [
        'error',
        'single',
        {
          'avoidEscape': true,
          'allowTemplateLiterals': true
        }
      ],
      '@stylistic/ts/member-delimiter-style': [
        'error',
        {
          'multiline': {
            'delimiter': 'semi',
            'requireLast': true
          },
          'singleline': {
            'delimiter': 'semi',
            'requireLast': false
          }
        }
      ]
    }
  }
];

export default config;
