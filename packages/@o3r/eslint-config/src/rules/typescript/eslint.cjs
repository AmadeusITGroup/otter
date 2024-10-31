'use strict';
const eslint = require('@eslint/js');
const { convertWarningsToErrors } = require('../utils.cjs');

const defaultNewCapOptions = {
  newIsCap: true,
  capIsNew: true,
  properties: true,
  capIsNewExceptions: [
    'AsyncInput',
    'Component',
    'Directive',
    'HostBinding',
    'HostListener',
    'Inject',
    'Injectable',
    'Input',
    'Localization',
    'NgModule',
    'Optional',
    'Output',
    'Pipe',
    'ViewChild',
    'ViewChildren',
    'SkipSelf',
    'Host',
    'ContentChildren',
    'O3rComponent',
    'ConfigObserver',
    'O3rConfig'
  ]
};
/**
 * @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.ConfigArray}
 */
const config = [
  {
    name: '@o3r/eslint-config/eslint-js',
    files: [
      '**/*.{c,m,}{t,j}s'
    ],
    rules: {
      ...convertWarningsToErrors(eslint.configs.recommended),
      'complexity': 'off',
      'constructor-super': 'error',
      'curly': 'error',
      'dot-notation': 'error',
      'eqeqeq': [
        'error',
        'smart'
      ],
      'getter-return': 'error',
      'guard-for-in': 'error',
      'id-denylist': ['error',
        'any',
        'Number',
        'String',
        'string',
        'Boolean',
        'boolean',
        'Undefined',
        'undefined'
      ],
      'id-match': 'error',
      'max-classes-per-file': 'off',
      'new-cap': [
        'error',
        defaultNewCapOptions
      ],
      'no-alert': 'error',
      'no-bitwise': 'error',
      'no-caller': 'error',
      'no-console': 'error',
      'no-dupe-args': 'error',
      'no-dupe-keys': 'error',
      'no-empty': 'off',
      'no-empty-function': 'off',
      'no-eval': 'error',
      'no-func-assign': 'error',
      'no-import-assign': 'error',
      'no-inner-declarations': 'error',
      'no-invalid-this': 'off',
      'no-iterator': 'error',
      'no-loop-func': 'error',
      'no-multi-str': 'error',
      'no-new-native-nonconstructor': 'error',
      'no-new-wrappers': 'error',
      'no-obj-calls': 'error',
      'no-proto': 'error',
      'no-restricted-imports': ['error', {
        patterns: [
          'rxjs/internal/*'
        ]
      }],
      'no-sequences': 'error',
      'no-setter-return': 'error',
      'no-shadow': 'off',
      'no-this-before-super': 'error',
      'no-undef': 'error',
      'no-undef-init': 'error',
      'no-underscore-dangle': [
        'error',
        {
          allowAfterThis: true
        }
      ],
      'no-unreachable': 'error',
      'no-unsafe-negation': 'error',
      'object-shorthand': 'off',
      'one-var': [
        'error',
        'never'
      ],
      'radix': 'error',
      'sort-imports': [
        'error',
        {
          allowSeparatedGroups: false,
          ignoreDeclarationSort: true,
          ignoreCase: true
        }
      ],
      'strict': [
        'error',
        'global'
      ]
    }
  },
  {
    name: '@o3r/eslint-config/eslint-js/typescript',
    files: [
      '**/*.{c,m,}ts'
    ],
    rules: {
      'new-cap': [
        'error',
        {
          ...defaultNewCapOptions,
          newIsCap: false
        }
      ]
    }
  }
];

module.exports = config;
