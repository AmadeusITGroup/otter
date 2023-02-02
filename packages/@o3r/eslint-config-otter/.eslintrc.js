/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable quote-props */

module.exports = {
  'root': true,
  'parserOptions': {
    'tsconfigRootDir': __dirname,
    'sourceType': 'module',
    'project': [
      'tsconfig.builders.json',
      'tsconfig.eslint.json'
    ]
  },
  'extends': [
    '../../../.eslintrc.js'
  ]
};
