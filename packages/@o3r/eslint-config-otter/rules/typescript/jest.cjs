/* eslint-disable @typescript-eslint/naming-convention */

module.exports = {
  extends: [
    'plugin:jest/recommended'
  ],
  plugins: [
    'jest'
  ],
  'rules': {
    'jest/no-conditional-expect': 'warn',
    'jest/no-done-callback': 'warn'
  }
};
