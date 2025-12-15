const path = require('node:path');
const { createDefaultPreset } = require('ts-jest');
const { getOtterJestBaseConfig, getJestUnitTestConfig, getTsJestBaseConfig } = require('@o3r/test-helpers');

const rootDir = path.join(__dirname, '..');

/** @type {import('ts-jest/dist/types').JestConfigWithTsJest} */
module.exports = {
  ...createDefaultPreset(getTsJestBaseConfig()),
  ...getOtterJestBaseConfig(rootDir),
  ...getJestUnitTestConfig({
    testPathIgnorePatterns: [
      '<rootDir>/builders/.*',
      '<rootDir>/schematics/.*'
    ],
    testEnvironment: 'node'
  }),
};
