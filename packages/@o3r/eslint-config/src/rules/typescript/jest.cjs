/**
 * @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.ConfigArray}
 */
const config = [
  {
    name: '@o3r/overrides/jest',
    files: [
      '**/*.{c,m,}{t,j}s'
    ],
    rules: {
      'jest/no-conditional-expect': 'warn',
      'jest/no-done-callback': 'warn'
    }
  }
];

module.exports = config;
