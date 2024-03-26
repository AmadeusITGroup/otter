const path = require('node:path');
const getJestProjectConfig = require('../../../../jest.config.ut').getJestProjectConfig;
const rootDir = path.join(__dirname, '..');
const defaultConfig = getJestProjectConfig(rootDir, true);

/** @type {import('ts-jest/dist/types').JestConfigWithTsJest} */
module.exports = {
  ...defaultConfig,
  displayName: require('../package.json').name,
  rootDir,
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
    '<rootDir>/builders/.*',
    '<rootDir>/schematics/.*',
    '\\.it\\.spec\\.ts$'
  ]
};
