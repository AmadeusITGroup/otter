'use strict';
/**
 * Get the @o3r plugin
 * @param {import('@typescript-eslint/utils').TSESLint.FlatConfig.Plugin} plugin
 * @returns {import('@typescript-eslint/utils').TSESLint.FlatConfig.Config} config
 */
const base = (plugin) => ({
  name: '@o3r/eslint-config/base',
  languageOptions: {
    sourceType: 'module'
  },
  plugins: {
    '@o3r': plugin
  }
});

module.exports = base;
