const o3rBaseConfig = require('../base.cjs');

/**
 * Get the @o3r typescript recommended rules
 * @param {import('@typescript-eslint/utils').TSESLint.FlatConfig.Plugin} plugin
 * @returns {import('@typescript-eslint/utils').TSESLint.FlatConfig.Config}
 */
const o3rTypescriptRecommended = (plugin) => [
  o3rBaseConfig(plugin),
  {
    name: '@o3r/eslint-config/typescript-recommended',
    // Same files as the ones asked by `typescript-eslint` recommendation
    files: ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts'],
    rules: {
      '@o3r/matching-configuration-name': 'error',
      '@o3r/no-multiple-type-configuration-property': 'error',
      '@o3r/no-folder-import-for-module': 'error',
      '@o3r/o3r-categories-tags': 'error'
    }
  }
];

module.exports = o3rTypescriptRecommended;
