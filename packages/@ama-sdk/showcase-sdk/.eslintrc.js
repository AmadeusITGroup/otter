/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable quote-props */

module.exports = {
  'root': true,
  'parserOptions': {
    'tsconfigRootDir': __dirname,
    'project': [
      'tsconfig.eslint.json',
      'testing/tsconfig.spec.json',
      'tsconfigs/tsconfig.jasmine.json',
      'tsconfigs/tsconfig.jest.json',
      'tsconfigs/tsconfig.source.json'
    ],
    'ecmaVersion': 12,
    'extraFileExtensions': ['.json']
  },
  'overrides': [
    {
      'files': ['*.ts'],
      'rules': {
        '@typescript-eslint/no-unused-vars': 'off',
        '@typescript-eslint/naming-convention': 'off',
        '@typescript-eslint/restrict-template-expressions': 'off',
        'max-len': 'off',
        'no-redeclare': 'off',
        'no-use-before-define': 'off',
        'no-useless-escape': 'off'
      }
    },
    {
      'files': ['*.jasmine.fixture.ts', '*api.fixture.ts'],
      'rules': {
        'jest/no-jasmine-globals': 'off'
      }
    },
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

