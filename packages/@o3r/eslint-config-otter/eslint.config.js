const {globalSharedConfig} = require('../../../eslint.config.js');

module.exports = [
  ...globalSharedConfig,
  {
    name: '@o3r/eslint-config-otter/projects',
    languageOptions: {
      sourceType: 'module',
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: [
          'tsconfig.builders.json',
          'tsconfig.eslint.json',
          'tsconfig.spec.json'
        ]
      }
    }
  }
];
