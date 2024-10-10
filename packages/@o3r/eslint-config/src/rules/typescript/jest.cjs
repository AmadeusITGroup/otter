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
      'jest/expect-expect': 'error',
      'jest/no-commented-out-tests': 'error',
      'jest/no-conditional-expect': 'error',
      'jest/no-disabled-tests': 'error',
      'jest/no-done-callback': 'error'
    }
  }
];

module.exports = config;
