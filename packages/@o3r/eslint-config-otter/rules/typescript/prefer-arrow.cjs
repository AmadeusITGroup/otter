/* eslint-disable @typescript-eslint/naming-convention */

module.exports = {
  plugins: [
    'prefer-arrow'
  ],
  rules: {
    'prefer-arrow/prefer-arrow-functions': [
      'error',
      {
        'allowStandaloneDeclarations': true
      }
    ]
  }
};
