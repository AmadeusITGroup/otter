const {globalSharedConfig} = require('../../../eslint.config.js');

module.exports = [
  ...globalSharedConfig,
  {
    name: '@o3r/mobile/projects',
    languageOptions: {
      sourceType: 'module',
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: [
          'tsconfig.build.json',
          'tsconfig.builders.json',
          'tsconfig.spec.json',
          'tsconfig.eslint.json',
          'tsconfig.pcloudy.json'
        ]
      }
    }
  }
];
