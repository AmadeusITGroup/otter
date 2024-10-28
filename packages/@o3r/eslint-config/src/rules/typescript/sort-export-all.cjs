const sortExportAll = require('eslint-plugin-sort-export-all');

/**
 * @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.ConfigArray}
 */
const config = [
  {
    name: '@o3r/eslint-config/sort-export-all',
    plugins: {
      'sort-export-all': sortExportAll
    },
    files: [
      '**/*.{c,m,}{t,j}s'
    ],
    rules: {
      'sort-export-all/sort-export-all': 'error'
    }
  }
];

module.exports = config;
