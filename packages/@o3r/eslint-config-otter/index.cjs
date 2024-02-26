/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable quote-props */
module.exports = {
  'extends': [
    'plugin:jest/recommended'
  ],
  'plugins': [
    'jest'
  ],
  'overrides': [
    {
      'files': ['*.ts', '*.tsx', '*.cts', '*.mts'],
      'extends': [
        './typescript.cjs'
      ],
    }
  ],
  'rules': {
    'jest/no-conditional-expect': 'warn',
    'jest/no-done-callback': 'warn'
  }
};
