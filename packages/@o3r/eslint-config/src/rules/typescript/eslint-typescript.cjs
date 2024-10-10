/**
 * @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.ConfigArray}
 */
const config = [
  {
    name: '@o3r/overrides/typescript-eslint',
    // Same files as the ones asked by `typescript-eslint/eslint-recommended`
    files: ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts'],
    rules: {
      '@typescript-eslint/adjacent-overload-signatures': 'error',
      '@typescript-eslint/array-type': [
        'error',
        {
          default: 'array'
        }
      ],
      '@typescript-eslint/consistent-type-assertions': 'error',
      '@typescript-eslint/dot-notation': 'error',
      '@typescript-eslint/explicit-member-accessibility': [
        'error',
        {
          accessibility: 'explicit',
          overrides: {
            constructors: 'off'
          }
        }
      ],
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/member-ordering': [
        'error',
        {
          default: [
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
          selector: 'default',
          format: ['camelCase'],
          leadingUnderscore: 'allow',
          trailingUnderscore: 'allow'
        },
        {
          selector: 'variable',
          format: ['camelCase', 'UPPER_CASE'],
          leadingUnderscore: 'allow',
          trailingUnderscore: 'allow'
        },
        {
          selector: 'typeLike',
          format: ['PascalCase']
        },
        {
          selector: 'property',
          modifiers: ['readonly'],
          format: ['camelCase', 'UPPER_CASE']
        },
        {
          selector: 'enumMember',
          format: ['camelCase', 'UPPER_CASE']
        },
        {
          selector: 'import',
          format: ['camelCase', 'PascalCase']
        }
      ],
      '@typescript-eslint/no-dupe-class-members': 'error',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-inferrable-types': 'error',
      '@typescript-eslint/no-misused-promises': [
        'error',
        {
          checksVoidReturn: false
        }
      ],
      '@typescript-eslint/no-namespace': 'off',
      '@typescript-eslint/no-non-null-asserted-optional-chain': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-parameter-properties': 'off',
      '@typescript-eslint/no-redeclare': 'error',
      '@typescript-eslint/no-redundant-type-constituents': 'off',
      '@typescript-eslint/no-require-imports': 'error',
      '@typescript-eslint/no-shadow': [
        'error',
        {
          hoist: 'all'
        }
      ],
      '@typescript-eslint/no-unsafe-enum-comparison': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          caughtErrors: 'none',
          ignoreRestSiblings: true
        }
      ],
      '@typescript-eslint/no-use-before-define': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-argument': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      '@typescript-eslint/only-throw-error': 'error',
      '@typescript-eslint/prefer-for-of': 'error',
      '@typescript-eslint/prefer-function-type': 'error',
      '@typescript-eslint/prefer-promise-reject-errors': 'error',
      '@typescript-eslint/prefer-regexp-exec': 'off',
      '@typescript-eslint/triple-slash-reference': [
        'error',
        {
          path: 'always',
          types: 'prefer-import',
          lib: 'always'
        }
      ],
      '@typescript-eslint/unbound-method': 'error',
      '@typescript-eslint/unified-signatures': 'error',
      '@typescript-eslint/prefer-readonly': 'error'
    }
  }
];

module.exports = config;
