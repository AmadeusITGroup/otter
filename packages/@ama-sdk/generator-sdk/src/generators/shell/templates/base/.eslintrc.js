/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable quote-props */

module.exports = {
  'parser': require.resolve('@typescript-eslint/parser'),
  'parserOptions': {
    'tsconfigRootDir': __dirname,
    'project': [
      'testing/tsconfig.spec.json',
      'tsconfigs/tsconfig.jest.json',
      'tsconfigs/tsconfig.jasmine.json',
      'tsconfigs/tsconfig.source.json'
    ],
    'ecmaVersion': 12
  },
  'env': {
    'browser': true,
    'node': true,
    'es6': true,
    'jasmine': true,
    'jest': true,
    'jest/globals': true
  },
  'settings': {
    'import/resolver': 'node'
  },
  'overrides': [
    {
      'files': ['*.helper.ts'],
      'rules': {
        '@typescript-eslint/explicit-function-return-type': 'error'
      }
    },
    {
      'files': ['*.js'],
      'rules': {
        '@typescript-eslint/restrict-template-expressions': 'off'
      }
    }
  ],
  'plugins': [
    'jest'
  ],
  'extends': [
    '@o3r/eslint-config-otter'
  ].map(require.resolve)
};

