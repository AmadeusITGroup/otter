/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable quote-props */

module.exports = {
  'parser': require.resolve('@typescript-eslint/parser'),
  'parserOptions': {
    'tsconfigRootDir': __dirname,
    'project': [
      'tsconfig.app.json',
      'tsconfig.eslint.json'
    ],
    'ecmaVersion': 12
  },
  'env': {
    'browser': true,
    'node': true,
    'es6': true,
    'jasmine': true
  },
  'extends': [
    '@o3r/eslint-config-otter'
  ].map(require.resolve)
};
