const preferArrowPlugin = require('eslint-plugin-prefer-arrow');

/** @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.ConfigArray} */
const config = [
  {
    name: '@o3r/overrides/prefer-arrow',
    files: [
      '**/*.{c,m,}{t,j}s'
    ],
    plugins: {
      'prefer-arrow': preferArrowPlugin
    },
    rules: {
      'prefer-arrow/prefer-arrow-functions': [
        'error',
        {
          allowStandaloneDeclarations: true
        }
      ]
    }
  }
];

module.exports = config;
