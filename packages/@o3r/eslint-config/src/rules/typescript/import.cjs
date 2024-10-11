/**
 * @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.ConfigArray}
 */
const config = [
  {
    name: '@o3r/overrides/import',
    files: [
      '**/*.{c,m,}{t,j}s'
    ],
    rules: {
      'import/first': 'error',
      'import/newline-after-import': 'error',
      'import/no-cycle': 'error',
      'import/no-named-as-default': 'error',
      'import/no-named-as-default-member': 'error',
      'import/no-duplicates': 'error',
      'import/no-unresolved': 'off',
      'import/order': ['error', {
        'newlines-between': 'never',
        'alphabetize': { order: 'asc', caseInsensitive: true }
      }]
    }
  }
];

module.exports = config;
