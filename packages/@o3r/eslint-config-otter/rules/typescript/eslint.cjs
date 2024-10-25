module.exports = {
  extends: [
    'eslint:recommended'
  ],
  rules: {
    'require-await': 'error',
    'camelcase': 'error',
    'comma-dangle': 'error',
    'comma-style': [
      'error',
      'last'
    ],
    'complexity': 'off',
    'constructor-super': 'error',
    'curly': 'error',
    'dot-location': [
      'error',
      'property'
    ],
    'dot-notation': 'error',
    'eol-last': 'error',
    'eqeqeq': [
      'error',
      'smart'
    ],
    'for-direction': 'error',
    'getter-return': 'error',
    'guard-for-in': 'error',
    'id-blacklist': ['error',
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
    'indent': [
      'error',
      2,
      {
        'FunctionDeclaration': {
          'parameters': 'off'
        },
        'SwitchCase': 1
      }
    ],

    'key-spacing': [
      'warn',
      {
        'beforeColon': false,
        'afterColon': true
      }
    ],
    'linebreak-style': [
      'error',
      'unix'
    ],
    'max-classes-per-file': 'off',
    'max-len': [
      'error',
      {
        'code': 200
      }
    ],
    'new-cap': [
      'error',
      {
        'newIsCap': true,
        'capIsNew': true,
        'properties': true,
        'capIsNewExceptions': [
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
      }
    ],
    'new-parens': 'error',
    'no-alert': 'error',
    'no-array-constructor': 'off',
    'no-async-promise-executor': 'error',
    'no-bitwise': 'error',
    'no-caller': 'error',
    'no-case-declarations': 'error',
    'no-class-assign': 'error',
    'no-compare-neg-zero': 'error',
    'no-cond-assign': 'error',
    'no-console': [
      'error',
      {
        'allow': [
          'warn',
          'dir',
          'time',
          'timeEnd',
          'timeLog',
          'trace',
          'assert',
          'clear',
          'count',
          'countReset',
          'group',
          'groupEnd',
          'table',
          'debug',
          'info',
          'dirxml',
          'groupCollapsed',
          'Console',
          'profile',
          'profileEnd',
          'timeStamp',
          'context'
        ]
      }
    ],
    'no-const-assign': 'error',
    'no-constant-condition': 'error',
    'no-control-regex': 'error',
    'no-debugger': 'error',
    'no-delete-var': 'error',
    'no-dupe-args': 'error',
    'no-dupe-class-members': 'off',
    'no-dupe-else-if': 'error',
    'no-dupe-keys': 'error',
    'no-duplicate-case': 'error',
    'no-empty': 'off',
    'no-empty-character-class': 'error',
    'no-empty-function': 'off',
    'no-empty-pattern': 'error',
    'no-eval': 'error',
    'no-ex-assign': 'error',
    'no-extra-boolean-cast': 'error',
    'no-fallthrough': 'error',
    'no-func-assign': 'error',
    'no-global-assign': 'error',
    'no-import-assign': 'error',
    'no-inner-declarations': 'error',
    'no-invalid-regexp': 'error',
    'no-invalid-this': 'off',
    'no-irregular-whitespace': 'error',
    'no-iterator': 'error',
    'no-loop-func': 'warn',
    'no-misleading-character-class': 'error',
    'no-mixed-spaces-and-tabs': 'error',
    'no-multi-spaces': 'error',
    'no-multi-str': 'error',
    'no-multiple-empty-lines': 'off',
    'no-new-symbol': 'error',
    'no-new-wrappers': 'error',
    'no-obj-calls': 'error',
    'no-octal': 'error',
    'no-proto': 'error',
    'no-prototype-builtins': 'error',
    'no-redeclare': 'off',
    'no-regex-spaces': 'error',
    'no-restricted-imports': ['error', {
      'patterns': [
        'rxjs/internal/*'
      ]
    }],
    'no-self-assign': 'error',
    'no-sequences': 'error',
    'no-setter-return': 'error',
    'no-shadow': 'off',
    'no-shadow-restricted-names': 'error',
    'no-sparse-arrays': 'error',
    'no-this-before-super': 'error',
    'no-throw-literal': 'error',
    'no-trailing-spaces': 'error',
    'no-undef': 'error',
    'no-undef-init': 'error',
    'no-underscore-dangle': [
      'error',
      {
        'allowAfterThis': true
      }
    ],
    'no-unexpected-multiline': 'error',
    'no-unreachable': 'error',
    'no-unsafe-finally': 'error',
    'no-unsafe-negation': 'error',
    'no-unused-labels': 'error',
    'no-unused-vars': 'off',
    'no-use-before-define': [
      'error',
      {
        'classes': false
      }
    ],
    'no-useless-catch': 'error',
    'no-useless-escape': 'error',
    'no-var': 'error',
    'no-with': 'error',
    'object-shorthand': 'off',
    'one-var': [
      'error',
      'never'
    ],
    'prefer-const': 'error',
    'quotes': [
      'error',
      'single',
      {
        'allowTemplateLiterals': true
      }
    ],
    'radix': 'error',
    'require-yield': 'error',
    'semi': [
      'error',
      'always'
    ],
    'semi-spacing': [
      'warn',
      {
        'before': false,
        'after': true
      }
    ],
    'sort-imports': [
      'error',
      {
        'allowSeparatedGroups': true,
        'ignoreDeclarationSort': true,
        'ignoreCase': true
      }
    ],
    'space-in-parens': [
      'error',
      'never'
    ],
    'space-unary-ops': 'warn',
    'spaced-comment': [
      'error',
      'always',
      {
        'markers': [
          '/'
        ]
      }
    ],
    'strict': [
      'error',
      'global'
    ],
    'use-isnan': 'error',
    'wrap-iife': [
      'error',
      'inside'
    ]
  }
};
