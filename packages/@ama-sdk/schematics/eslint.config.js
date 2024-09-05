const {globalSharedConfig} = require('../../../eslint.config.js');

module.exports = [
  ...globalSharedConfig,
  {
    name: '@ama-sdk/schematics/language-options',
    languageOptions: {
      sourceType: 'module',
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: [
          'tsconfig.builders.json',
          'tsconfig.spec.json',
          'tsconfig.eslint.json',
          'tsconfig.cli.json'
        ]
      }
    }
  }
];
