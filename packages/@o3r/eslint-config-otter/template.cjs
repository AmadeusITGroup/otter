/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable quote-props */

module.exports = {
  'extends': [
    'plugin:@angular-eslint/template/recommended',
    'plugin:@o3r/template-recommended'
  ],
  'plugins': [
    '@o3r'
  ],
  'rules': {
    'max-len': 'off',

    '@o3r/template-async-number-limitation': [
      'error',
      {
        maximumAsyncOnTag: 4
      }
    ]
  }
};
