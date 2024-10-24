const o3rBaseConfig = require('../base.cjs');

/**
 * Get the @o3r template recommended rules
 * @param {import('@typescript-eslint/utils').TSESLint.FlatConfig.Plugin} plugin
 * @returns {import('@typescript-eslint/utils').TSESLint.FlatConfig.ConfigArray}
 */
const o3rTemplateRecommended = (plugin) => [
  o3rBaseConfig(plugin),
  {
    name: '@o3r/template-recommended',
    files: ['**/*.html'],
    rules: {
      '@o3r/template-async-number-limitation': 'error'
    }
  }
];

module.exports = o3rTemplateRecommended;