/* eslint-disable @typescript-eslint/naming-convention */

module.exports = {
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-type-checked'
  ],
  plugins: [
    '@typescript-eslint'
  ],
  rules: {
    '@typescript-eslint/adjacent-overload-signatures': 'error',
    '@typescript-eslint/array-type': [
      'error',
      {
        'default': 'array'
      }
    ],
    '@typescript-eslint/ban-ts-comment': 'error',
    '@typescript-eslint/ban-types': [
      'error',
      {
        'types': {
          '{}': {
            'message': 'Use object instead',
            'fixWith': 'object'
          },
          'Object': {
            'message': 'Avoid using the `Object` type. Did you mean `object`?'
          },
          'Function': {
            'message': 'Avoid using the `Function` type. Prefer a specific function type, like `() => void`.'
          },
          'Boolean': {
            'message': 'Avoid using the `Boolean` type. Did you mean `boolean`?'
          },
          'Number': {
            'message': 'Avoid using the `Number` type. Did you mean `number`?'
          },
          'String': {
            'message': 'Avoid using the `String` type. Did you mean `string`?'
          },
          'Symbol': {
            'message': 'Avoid using the `Symbol` type. Did you mean `symbol`?'
          }
        }
      }
    ],
    '@typescript-eslint/consistent-type-assertions': 'error',
    '@typescript-eslint/dot-notation': 'error',
    '@typescript-eslint/explicit-member-accessibility': [
      'error',
      {
        'accessibility': 'explicit',
        'overrides': {
          'constructors': 'off'
        }
      }
    ],
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/member-ordering': [
      'error',
      {
        'default': [
          'static-field',
          'static-field',
          'instance-field',
          'constructor',
          'decorated-method',
          'private-instance-method',
          'protected-instance-method',
          'public-instance-method'
        ]
      }
    ],
    '@typescript-eslint/naming-convention': [
      'error',
      {
        'selector': 'default',
        'format': ['camelCase'],
        'leadingUnderscore': 'allow',
        'trailingUnderscore': 'allow'
      },
      {
        'selector': 'variable',
        'format': ['camelCase', 'UPPER_CASE'],
        'leadingUnderscore': 'allow',
        'trailingUnderscore': 'allow'
      },
      {
        'selector': 'typeLike',
        'format': ['PascalCase']
      },
      {
        'selector': 'property',
        'modifiers': ['readonly'],
        'format': ['camelCase', 'UPPER_CASE']
      },
      {
        'selector': 'enumMember',
        'format': ['camelCase', 'UPPER_CASE']
      },
      {
        'selector': 'import',
        'format': ['camelCase', 'PascalCase']
      }
    ],
    '@typescript-eslint/no-array-constructor': 'error',
    '@typescript-eslint/no-dupe-class-members': 'error',
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-extra-non-null-assertion': 'error',
    '@typescript-eslint/no-inferrable-types': 'warn',
    '@typescript-eslint/no-misused-new': 'error',
    '@typescript-eslint/no-misused-promises': [
      'error',
      {
        'checksVoidReturn': false
      }
    ],
    '@typescript-eslint/no-namespace': 'off',
    '@typescript-eslint/no-non-null-asserted-optional-chain': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-parameter-properties': 'off',
    '@typescript-eslint/no-redeclare': 'error',
    '@typescript-eslint/no-shadow': [
      'error',
      {
        'hoist': 'all'
      }
    ],
    '@typescript-eslint/no-this-alias': 'error',
    '@typescript-eslint/no-unsafe-enum-comparison': 'warn',
    '@typescript-eslint/no-unused-expressions': 'error',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        'argsIgnorePattern': '^_'
      }
    ],
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'warn',
    '@typescript-eslint/no-unsafe-argument': 'warn',
    '@typescript-eslint/no-unsafe-member-access': 'warn',
    '@typescript-eslint/no-unsafe-call': 'warn',
    '@typescript-eslint/no-unsafe-return': 'warn',
    '@typescript-eslint/prefer-as-const': 'error',
    '@typescript-eslint/prefer-for-of': 'error',
    '@typescript-eslint/prefer-function-type': 'error',
    '@typescript-eslint/prefer-namespace-keyword': 'error',
    '@typescript-eslint/prefer-regexp-exec': 'off',
    '@typescript-eslint/triple-slash-reference': [
      'error',
      {
        'path': 'always',
        'types': 'prefer-import',
        'lib': 'always'
      }
    ],
    '@typescript-eslint/unbound-method': 'warn',
    '@typescript-eslint/unified-signatures': 'error',
    '@typescript-eslint/prefer-readonly': 'error'
  }
};
