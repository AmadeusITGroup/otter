/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable quote-props */

module.exports = {
  'root': true,
  'parserOptions': {
    'EXPERIMENTAL_useSourceOfProjectReferenceRedirect': true,
    'tsconfigRootDir': __dirname,
    'project': [
      'tsconfig.build.json',
      'tsconfig.builders.json',
      'tsconfig.spec.json',
      'tsconfig.eslint.json'
    ],
    'sourceType': 'module'
  },
  'extends': [
    '../../../.eslintrc.js'
  ]
};
