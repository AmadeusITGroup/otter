const {globalSharedConfig} = require('../../eslint.config.js');
const {default: o3rTemplate} = require('@o3r/eslint-config/template');

module.exports = [
  ...globalSharedConfig,
  ...o3rTemplate,
  {
    name: '@o3r/chrome-devtools/projects',
    languageOptions: {
      sourceType: 'module',
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: [
          'tsconfig.build.json',
          'tsconfig.spec.json',
          'tsconfig.extension.json',
          'tsconfig.eslint.json'
        ]
      }
    }
  }
];
