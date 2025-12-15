const path = require('node:path');
const { getAngularJestConfig, getOtterJestBaseConfig, getJestUnitTestConfig } = require('@o3r/test-helpers');

const rootDir = path.join(__dirname, '..');

/** @type {import('ts-jest/dist/types').JestConfigWithTsJest} */
module.exports = {
  ...getAngularJestConfig(),
  ...getOtterJestBaseConfig(rootDir),
  ...getJestUnitTestConfig({
    testPathIgnorePatterns: [
      '<rootDir>/src/.*'
    ],
    testEnvironment: 'node',
  }),
  setupFilesAfterEnv: ['<rootDir>/testing/setup-jest.builders.ts']
};
