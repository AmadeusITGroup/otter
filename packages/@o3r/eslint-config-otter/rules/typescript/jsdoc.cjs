module.exports = {
  extends: [
    'plugin:jsdoc/recommended'
  ],
  plugins: [
    'jsdoc'
  ],
  rules: {
    'jsdoc/check-access': 'warn',
    'jsdoc/check-alignment': 'error',
    // TODO: Activate when available on ESLint 8+ (cf. https://github.com/eslint/eslint/issues/14745)
    // 'jsdoc/check-examples': ['error', {
    //   'exampleCodeRegex': '^```(?:javascript|typescript|java|json|yaml|shell)?([\\s\\S]*)```\\s*$'
    // }],
    'jsdoc/check-indentation': 'off',
    'jsdoc/check-line-alignment': 'off',
    'jsdoc/check-param-names': 'warn',
    'jsdoc/check-property-names': 'warn',
    'jsdoc/check-syntax': 'off',
    'jsdoc/check-tag-names': [
      'warn',
      {
        definedTags: ['note', 'title', 'o3rCategory', 'o3rCategories', 'o3rWidget', 'o3rWidgetParam', 'o3rRequired']
      }
    ],
    'jsdoc/check-types': 'warn',
    'jsdoc/check-values': 'warn',
    'jsdoc/empty-tags': 'warn',
    'jsdoc/implements-on-classes': 'warn',
    'jsdoc/match-description': 'off',
    'jsdoc/no-bad-blocks': 'off',
    'jsdoc/no-defaults': 'off',
    'jsdoc/no-types': 'off',
    'jsdoc/no-undefined-types': 'off',
    'jsdoc/require-description': 'warn',
    'jsdoc/require-description-complete-sentence': 'off',
    'jsdoc/require-example': 'off',
    'jsdoc/require-file-overview': 'off',
    'jsdoc/require-hyphen-before-param-description': 'off',
    'jsdoc/require-jsdoc': [
      'error',
      {
        publicOnly: true
      }
    ],
    'jsdoc/require-param': 'warn',
    'jsdoc/require-param-description': 'warn',
    'jsdoc/require-param-name': 'warn',
    'jsdoc/require-param-type': 'off',
    'jsdoc/require-property': 'warn',
    'jsdoc/require-property-description': 'warn',
    'jsdoc/require-property-name': 'warn',
    'jsdoc/require-property-type': 'off',
    'jsdoc/require-returns': 'off',
    'jsdoc/require-returns-check': 'warn',
    'jsdoc/require-returns-description': 'warn',
    'jsdoc/require-returns-type': 'off',
    'jsdoc/valid-types': 'warn'
  }
};
