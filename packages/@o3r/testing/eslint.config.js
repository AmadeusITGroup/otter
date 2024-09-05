const {globalSharedConfig} = require('../../../eslint.config.js');

module.exports = [
  ...globalSharedConfig,
  {
    name: '@o3r/testing/projects',
    languageOptions: {
      sourceType: 'module',
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: [
          'tsconfig.tools.json',
          'tsconfig.schematics.json',
          'tsconfig.build.json',
          'tsconfig.eslint.json',
          'tsconfig.spec.json'
        ]
      }
    }
  }
];
