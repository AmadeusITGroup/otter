const path = require('node:path');
const getJestProjectConfig = require('../../../../jest.config.ut').getJestProjectConfig;
const rootDir = path.join(__dirname, '..');

const baseConfig = getJestProjectConfig(rootDir, true);

/** @type {import('ts-jest/dist/types').JestConfigWithTsJest} */
module.exports = {
  ...baseConfig,
  displayName: require('../package.json').name,
  transformIgnorePatterns: ['^.+\\.js$'],
  testPathIgnorePatterns: [
    ...baseConfig.testPathIgnorePatterns,
    '<rootDir>/builders/.*',
    '<rootDir>/schematics/.*'
  ]
};
