/**
 * Get the @o3r plugin
 * @param {import('@typescript-eslint/utils').TSESLint.FlatConfig.Plugin} plugin
 * @returns {import('@typescript-eslint/utils').TSESLint.FlatConfig.Config}
 */
const base = (plugin) => ({
  name: '@o3r/base',
  languageOptions: {
    sourceType: 'module'
  },
  plugins: {
    '@o3r': plugin
  }
});

module.exports = base;