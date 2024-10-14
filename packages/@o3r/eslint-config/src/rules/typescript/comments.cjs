/**
 * @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.ConfigArray}
 */
const config = [
  {
    name: '@o3r/overrides/eslint-comments',
    files: [
      '**/*.{c,m,}{t,j}s'
    ],
    rules: {
      '@eslint-community/eslint-comments/require-description': [
        'error',
        {
          ignore: ['eslint-enable']
        }
      ]
    }
  }
];

module.exports = config;
