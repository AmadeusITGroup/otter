/* eslint-disable @typescript-eslint/naming-convention */
import type { TSESLint } from '@typescript-eslint/utils';

export default (
  plugin: TSESLint.FlatConfig.Plugin
): TSESLint.FlatConfig.Config => ({
  name: '@o3r/base',
  languageOptions: {
    sourceType: 'module'
  },
  plugins: {
    '@o3r': plugin
  }
});
