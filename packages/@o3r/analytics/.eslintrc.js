/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable quote-props */

module.exports = {
  'root': true,
  'parserOptions': {
    'tsconfigRootDir': __dirname,
    'project': [
      'tsconfig.build.json',
      'tsconfig.builders.json',
      'tsconfig.fixture.jasmine.json',
      'tsconfig.fixture.jest.json',
      'tsconfig.spec.json',
      'tsconfig.eslint.json',
      'tsconfig.plugins.json'
    ],
    'sourceType': 'module'
  },
  'extends': [
    '../../../.eslintrc.js'
  ]
};
