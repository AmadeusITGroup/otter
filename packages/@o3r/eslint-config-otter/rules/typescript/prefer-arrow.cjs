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
