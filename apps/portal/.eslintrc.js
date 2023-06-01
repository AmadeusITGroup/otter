/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable quote-props */

module.exports = {
  'root': true,
  'parserOptions': {
    'tsconfigRootDir': __dirname,
    'project': [
      'tsconfig.base.json',
      'tsconfig.build.json',
      'tsconfig.cms.json',
      'tsconfig.dev.json',
      'tsconfig.eslint.json',
      'tsconfig.spec.json'
    ],
    'sourceType': 'module'
  },
  'extends': [
    '../../.eslintrc.js'
  ]
};
