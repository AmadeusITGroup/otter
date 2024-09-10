/* eslint-disable @typescript-eslint/naming-convention */
import type { TSESLint } from '@typescript-eslint/utils';
// @ts-expect-error -- this package does not expose typings
import preferArrowPlugin from 'eslint-plugin-prefer-arrow';

const config: TSESLint.FlatConfig.ConfigArray = [
  {
    name: '@o3r/overrides/prefer-arrow',
    plugins: {
      'prefer-arrow': preferArrowPlugin
    },
    rules: {
      'prefer-arrow/prefer-arrow-functions': [
        'error',
        {
          'allowStandaloneDeclarations': true
        }
      ]
    }
  }
];

export default config;
