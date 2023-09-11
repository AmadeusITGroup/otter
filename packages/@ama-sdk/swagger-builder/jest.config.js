const defaultConfig = require('../../../jest.config.ut');

/** @type {import('ts-jest/dist/types').JestConfigWithTsJest} */
module.exports = {
  ...defaultConfig,
  displayName: require('./package.json').name,
  preset: 'ts-jest',
  setupFilesAfterEnv: null,
  globalSetup: null,
  transform: {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.html$'
      }
    ]
  }
};
