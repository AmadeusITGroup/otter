const {globalSharedConfig} = require('../../../eslint.config.js');

module.exports = [
  ...globalSharedConfig,
  {
    name: 'cascading-gh-action/projects',
    languageOptions: {
      sourceType: 'module',
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: [
          'tsconfig.build.json',
          'tsconfig.eslint.json'
        ]
      }
    }
  }
];
