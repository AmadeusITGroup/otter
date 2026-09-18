const path = require('node:path');
const { getDefaultTsJestCjsPreset, getOtterJestBaseConfig, getJestUnitTestConfig } = require('@o3r/test-helpers');

const rootDir = path.join(__dirname, '..');

/** @type {import('ts-jest/dist/types').JestConfigWithTsJest} */
module.exports = {
  ...getDefaultTsJestCjsPreset(),
  ...getOtterJestBaseConfig(rootDir),
  ...getJestUnitTestConfig(),
  coveragePathIgnorePatterns: [
    '<rootDir>/src/api/**/*.ts',
    '<rootDir>/src/models/base/**/*.ts',
    '<rootDir>/src/spec/api-mock.ts',
    '<rootDir>/src/spec/operation-adapter.ts'
  ]
};
