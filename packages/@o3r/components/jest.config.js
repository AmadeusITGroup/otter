const getJestConfig = require('../../../jest.config.ut').getJestConfig;
const defaultConfig = getJestConfig(__dirname, true);

/** @type {import('ts-jest/dist/types').JestConfigWithTsJest} */
module.exports = {
  ...defaultConfig,
  displayName: require('./package.json').name,
  moduleNameMapper: {
    ...defaultConfig.moduleNameMapper,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '^@o3r/testing/core$': ['<rootDir>/../../@o3r/testing/src/core/angular'],
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '^@o3r/testing/core/(.*)$': ['<rootDir>/../../@o3r/testing/src/core/angular/$1']
  },
  testPathIgnorePatterns: [
    '<rootDir>/dist',
    '<rootDir>/.*/templates/.*',
    '\\.it\\.spec\\.ts$'
  ]
};
