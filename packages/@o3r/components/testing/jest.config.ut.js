const path = require('node:path');
const getJestProjectConfig = require('../../../../jest.config.ut').getJestProjectConfig;

const rootDir = path.join(__dirname, '..');
const defaultConfig = getJestProjectConfig(rootDir, true);

/** @type {import('ts-jest/dist/types').JestConfigWithTsJest} */
module.exports = {
  ...defaultConfig,
  displayName: require('../package.json').name,
  moduleNameMapper: {
    ...defaultConfig.moduleNameMapper,
    '^@o3r/testing/core$': ['<rootDir>/../../@o3r/testing/src/core/angular'],
    '^@o3r/testing/core/(.*)$': ['<rootDir>/../../@o3r/testing/src/core/angular/$1']
  },
  testPathIgnorePatterns: [
    ...defaultConfig.testPathIgnorePatterns,
    '<rootDir>/builders/.*',
    '<rootDir>/schematics/.*'
  ]
};
