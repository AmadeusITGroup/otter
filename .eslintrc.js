/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable quote-props */

module.exports = {
  'parser': require.resolve('@typescript-eslint/parser'),
  'parserOptions': {
    'tsconfigRootDir': __dirname,
    'project': [
      'tsconfig.eslint.json'
    ],
    'ecmaVersion': 12
  },
  'overrides': [
    {
      'files': [
        '*{.,-}jasmine.ts'
      ],
      'rules': {
        'jest/no-jasmine-globals': 'off'
      }
    }
  ],
  'env': {
    'browser': true,
    'node': true,
    'webextensions': true,

    'es6': true,
    'jasmine': true,
    'jest': true,
    'jest/globals': true
  },
  'globals': {
    'globalThis': true
  },
  'settings': {
    'import/resolver': 'node'
  },
  'extends': [
    '@o3r/eslint-config-otter'
  ].map(require.resolve)
};
