/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable quote-props */

module.exports = {
  'root': true,
  'parserOptions': {
    'tsconfigRootDir': __dirname,
    'project': [
      'tsconfig.eslint.json',
      'tsconfig.spec.json',
      'tsconfig.build.json',
      'tsconfig.builders.json'
    ],
    'sourceType': 'module'
  },
  'extends': [
    '../../../.eslintrc.js'
  ]
};
