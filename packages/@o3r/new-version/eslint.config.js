const {globalSharedConfig} = require('../../../eslint.config.js');

module.exports = [
  ...globalSharedConfig,
  {
    name: '@o3r/new-version/projects',
    languageOptions: {
      sourceType: 'module',
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: [
          'tsconfig.build.json',
          'tsconfig.builders.json',
          'tsconfig.spec.json',
          'tsconfig.eslint.json'
        ]
      }
    }
  }
];
