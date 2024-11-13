/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable quote-props */

module.exports = {
  'root': true,
  'parserOptions': {
    'tsconfigRootDir': __dirname,
    'project': [
      'tsconfig.eslint.json',
      'testing/tsconfig.spec.json',
      'tsconfigs/tsconfig.jest.json',
      'tsconfigs/tsconfig.source.json'
    ],
    'ecmaVersion': 12,
    'extraFileExtensions': ['.json']
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
  'extends': [
    '../../../.eslintrc.js'
  ]
};

