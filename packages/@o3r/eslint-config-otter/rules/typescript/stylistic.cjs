module.exports = {
  plugins: [
    '@stylistic/ts'
  ],
  rules: {
    '@stylistic/ts/key-spacing': [
      'warn',
      {
        'beforeColon': false,
        'afterColon': true
      }
    ],
    '@stylistic/ts/keyword-spacing': 'error',
    '@stylistic/ts/semi': [
      'error',
      'always'
    ],
    '@stylistic/ts/space-infix-ops': 'error',
    '@stylistic/ts/no-extra-semi': 'error',
    '@stylistic/ts/space-before-function-paren': [
      'error',
      {
        'anonymous': 'always',
        'named': 'never',
        'asyncArrow': 'always'
      }
    ],
    '@stylistic/ts/quotes': [
      'error',
      'single',
      {
        'avoidEscape': true,
        'allowTemplateLiterals': true
      }
    ],
    '@stylistic/ts/member-delimiter-style': [
      'error',
      {
        'multiline': {
          'delimiter': 'semi',
          'requireLast': true
        },
        'singleline': {
          'delimiter': 'semi',
          'requireLast': false
        }
      }
    ]
  }
};
