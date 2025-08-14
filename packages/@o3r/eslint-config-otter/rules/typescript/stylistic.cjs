module.exports = {
  plugins: [
    '@stylistic'
  ],
  rules: {
    '@stylistic/key-spacing': [
      'warn',
      {
        beforeColon: false,
        afterColon: true
      }
    ],
    '@stylistic/keyword-spacing': 'error',
    '@stylistic/semi': [
      'error',
      'always'
    ],
    '@stylistic/space-infix-ops': 'error',
    '@stylistic/no-extra-semi': 'error',
    '@stylistic/space-before-function-paren': [
      'error',
      {
        anonymous: 'always',
        named: 'never',
        asyncArrow: 'always'
      }
    ],
    '@stylistic/quotes': [
      'error',
      'single',
      {
        avoidEscape: true,
        allowTemplateLiterals: 'always'
      }
    ],
    '@stylistic/member-delimiter-style': [
      'error',
      {
        multiline: {
          delimiter: 'semi',
          requireLast: true
        },
        singleline: {
          delimiter: 'semi',
          requireLast: false
        }
      }
    ]
  }
};
