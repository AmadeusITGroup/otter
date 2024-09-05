const {globalSharedConfig} = require('../../../../eslint.config.js');

module.exports = [
  ...globalSharedConfig,
  {
    name: '@o3r/amaterasu/amaterasu-api-spec/projects',
    languageOptions: {
      sourceType: 'module',
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: [
          'tsconfig.build.json',
          'tsconfig.eslint.json',
          'tsconfig.spec.json'
        ]
      }
    }
  }
];
