module.exports = {
  extends: [
    'plugin:@angular-eslint/recommended'
  ],
  rules: {
    '@angular-eslint/no-host-metadata-property': 'off',
    '@angular-eslint/no-input-rename': 'off',
    '@angular-eslint/directive-class-suffix': 'off',
    '@angular-eslint/no-empty-lifecycle-method': 'off',
    '@angular-eslint/no-output-on-prefix': 'error',
    '@angular-eslint/directive-selector': [
      'error',
      {
        type: 'attribute',
        style: 'camelCase'
      }
    ],
    '@angular-eslint/component-selector': [
      'error',
      {
        type: 'element',
        style: 'kebab-case'
      }
    ]
  }
};
