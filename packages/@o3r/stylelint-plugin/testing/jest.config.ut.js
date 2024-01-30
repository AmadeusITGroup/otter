const path = require('node:path');
const getJestProjectConfig = require('../../../../jest.config.ut').getJestProjectConfig;
const rootDir = path.join(__dirname, '..');

/** @type {import('ts-jest/dist/types').JestConfigWithTsJest} */
module.exports = {
  ...getJestProjectConfig(rootDir, false),
  displayName: require('../package.json').name,
  rootDir,
  testEnvironmentOptions: {
    // workaround to use stylelint CommonJs interface
    customExportConditions: ['require']
  },
  testPathIgnorePatterns: [
    '<rootDir>/.*/templates/.*',
    '<rootDir>/builders/.*',
    '<rootDir>/schematics/.*',
    '\\.it\\.spec\\.ts$'
  ]
};
