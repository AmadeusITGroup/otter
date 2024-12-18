const path = require('node:path');
const getJestProjectConfig = require('../../../../jest.config.ut').getJestProjectConfig;

const rootDir = path.join(__dirname, '..');

const baseConfig = getJestProjectConfig(rootDir, false);

/** @type {import('ts-jest/dist/types').JestConfigWithTsJest} */
module.exports = {
  ...baseConfig,
  displayName: require('../package.json').name,
  resolver: '<rootDir>/testing/mjs-resolver.js',
  testEnvironmentOptions: {
    // workaround to use stylelint CommonJs interface
    customExportConditions: ['require']
  },
  testPathIgnorePatterns: [
    ...baseConfig.testPathIgnorePatterns,
    '<rootDir>/builders/.*',
    '<rootDir>/schematics/.*',
    '<rootDir>/src/.*' // TODO re-enable test
  ]
};
