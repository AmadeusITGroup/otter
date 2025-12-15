const path = require('node:path');
const { getAngularJestConfig, getOtterJestBaseConfig, getJestUnitTestConfig, getJestFixtureMapping } = require('@o3r/test-helpers');

const rootDir = path.join(__dirname, '..');

/** @type {import('ts-jest/dist/types').JestConfigWithTsJest} */
module.exports = {
  ...getAngularJestConfig(),
  ...getOtterJestBaseConfig(rootDir, {
    moduleNameMapper: getJestFixtureMapping('angular')
  }),
  ...getJestUnitTestConfig({
    testPathIgnorePatterns: [
      '<rootDir>/builders/.*',
      '<rootDir>/schematics/.*'
    ]
  }),
  setupFilesAfterEnv: ['<rootDir>/testing/setup-jest.ts']
};
