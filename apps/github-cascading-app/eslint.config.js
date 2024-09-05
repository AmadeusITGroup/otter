const {globalSharedConfig} = require('../../eslint.config.js');

module.exports = [
  ...globalSharedConfig,
  {
    name: '@o3r/github-cascading-app/projects',
    languageOptions: {
      sourceType: 'module',
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: [
          'tsconfig.build.json',
          'tsconfig.spec.json',
          'tsconfig.eslint.json'
        ]
      }
    }
  }
];
