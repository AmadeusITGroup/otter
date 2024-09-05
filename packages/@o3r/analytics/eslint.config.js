const {globalSharedConfig} = require('../../../eslint.config.js');

module.exports = [
  ...globalSharedConfig,
  {
    name: '@o3r/analytics/projects',
    languageOptions: {
      sourceType: 'module',
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: [
          'tsconfig.build.json',
          'tsconfig.builders.json',
          'tsconfig.fixture.jasmine.json',
          'tsconfig.fixture.jest.json',
          'tsconfig.spec.json',
          'tsconfig.eslint.json',
          'tsconfig.plugins.json'
        ]
      }
    }
  }
];
