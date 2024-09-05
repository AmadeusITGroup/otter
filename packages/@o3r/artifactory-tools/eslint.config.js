const {globalSharedConfig} = require('../../../eslint.config.js');

module.exports = [
  ...globalSharedConfig,
  {
    name: '@o3r/artifactory-tools/projects',
    languageOptions: {
      sourceType: 'module',
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: [
          'tsconfig.eslint.json',
          'tsconfig.build.json',
          'tsconfig.builders.json',
          'tsconfig.spec.json'
        ]
      }
    }
  }
];
