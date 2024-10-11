const importNewlinesPlugin = require('eslint-plugin-import-newlines');

/** @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.ConfigArray} */
const config = [
  {
    name: '@o3r/overrides/import-newlines',
    files: [
      '**/*.{c,m,}{t,j}s'
    ],
    plugins: {
      'import-newlines': importNewlinesPlugin
    },
    rules: {
      'import-newlines/enforce': [
        'error',
        0
      ]
    }
  }
];

module.exports = config;
