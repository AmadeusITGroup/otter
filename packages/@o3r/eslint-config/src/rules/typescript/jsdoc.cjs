/**
 * @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.ConfigArray}
 */
const config = [
  {
    name: '@o3r/overrides/jsdoc',
    files: [
      '**/*.{c,m,}{t,j}s'
    ],
    rules: {
      'jsdoc/check-access': 'error',
      'jsdoc/check-alignment': 'error',
      // TODO fix issue with ESLint v9+
      // 'jsdoc/check-examples': ['error', {
      //   'exampleCodeRegex': '^```(?:javascript|typescript|java|json|yaml|shell)?([\\s\\S]*)```\\s*$'
      // }],
      'jsdoc/check-param-names': 'error',
      'jsdoc/check-property-names': 'error',
      'jsdoc/check-tag-names': [
        'error',
        {
          definedTags: ['note', 'title', 'o3rCategory', 'o3rWidget', 'o3rWidgetParam', 'o3rRequired']
        }
      ],
      'jsdoc/check-types': 'error',
      'jsdoc/check-values': 'error',
      'jsdoc/empty-tags': 'error',
      'jsdoc/implements-on-classes': 'error',
      'jsdoc/multiline-blocks': 'error',
      'jsdoc/no-defaults': 'off',
      'jsdoc/no-multi-asterisks': 'error',
      'jsdoc/no-undefined-types': 'off',
      'jsdoc/require-description': 'error',
      'jsdoc/require-jsdoc': [
        'error',
        {
          publicOnly: true
        }
      ],
      'jsdoc/require-param': 'error',
      'jsdoc/require-param-description': 'error',
      'jsdoc/require-param-name': 'error',
      'jsdoc/require-param-type': 'off',
      'jsdoc/require-property': 'error',
      'jsdoc/require-property-description': 'error',
      'jsdoc/require-property-name': 'error',
      'jsdoc/require-property-type': 'off',
      'jsdoc/require-returns': 'off',
      'jsdoc/require-returns-check': 'error',
      'jsdoc/require-returns-description': 'error',
      'jsdoc/require-returns-type': 'off',
      'jsdoc/require-yields': 'error',
      'jsdoc/require-yields-check': 'error',
      'jsdoc/tag-lines': 'error',
      'jsdoc/valid-types': 'error'
    }
  }
];

module.exports = config;
