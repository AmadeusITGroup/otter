/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable quote-props */

module.exports = {
  'root': true,
  'parserOptions': {
    'tsconfigRootDir': __dirname,
    'sourceType': 'module',
    'project': [
      'tsconfig.build.json',
      'tsconfig.builders.json',
      'tsconfig.eslint.json',
      'tsconfig.spec.json'
    ]
  },
  'extends': [
    '../../../.eslintrc.js'
  ]
};
