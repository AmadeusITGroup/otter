const path = require('node:path');
const getJestProjectConfig = require('../../../../jest.config.ut').getJestProjectConfig;
const rootDir = path.join(__dirname, '..');

const baseConfig = getJestProjectConfig(rootDir, false);

/** @type {import('ts-jest/dist/types').JestConfigWithTsJest} */
module.exports = {
  ...baseConfig,
  displayName: require('../package.json').name,
  fakeTimers: {
    enableGlobally: true
  },
  globalSetup: '<rootDir>/testing/global-timezone-setup.js',
  testPathIgnorePatterns: [
    ...baseConfig.testPathIgnorePatterns,
    '<rootDir>/builders/.*',
    '<rootDir>/schematics/.*'
  ]
};
