/* eslint-disable @typescript-eslint/naming-convention */
import type { TSESLint } from '@typescript-eslint/utils';

const config: TSESLint.FlatConfig.ConfigArray = [
  {
    name: '@o3r/overrides/jsdoc',
    files: [
      '**/*.{c,m,}{t,j}s'
    ],
    rules: {
      'jsdoc/check-alignment': 'error',
      // TODO fix issue with ESLint v9+
      // 'jsdoc/check-examples': ['error', {
      //   'exampleCodeRegex': '^```(?:javascript|typescript|java|json|yaml|shell)?([\\s\\S]*)```\\s*$'
      // }],
      'jsdoc/check-tag-names': [
        'warn',
        {
          'definedTags': ['note', 'title', 'o3rCategory', 'o3rWidget', 'o3rWidgetParam', 'o3rRequired']
        }
      ],
      'jsdoc/no-defaults': 'off',
      'jsdoc/no-undefined-types': 'off',
      'jsdoc/require-description': 'warn',
      'jsdoc/require-jsdoc': [
        'error',
        {
          'publicOnly': true
        }
      ],
      'jsdoc/require-param-type': 'off',
      'jsdoc/require-property-type': 'off',
      'jsdoc/require-returns': 'off',
      'jsdoc/require-returns-type': 'off'
    }
  }
];

export default config;
