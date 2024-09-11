/* eslint-disable @typescript-eslint/naming-convention */
import type { TSESLint } from '@typescript-eslint/utils';

const config: TSESLint.FlatConfig.ConfigArray = [
  {
    name: '@o3r/overrides/jest',
    files: [
      '**/*.{c,m,}{t,j}s'
    ],
    rules: {
      'jest/no-conditional-expect': 'warn',
      'jest/no-done-callback': 'warn'
    }
  }
];

export default config;
