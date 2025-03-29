const path = require('node:path');
const { getTsJestBaseConfig, getOtterJestBaseConfig, getJestUnitTestConfig } = require('@o3r/test-helpers');
const { createDefaultPreset } = require('ts-jest');

const rootDir = path.join(__dirname, '..');

/** @type {import('ts-jest/dist/types').JestConfigWithTsJest} */
module.exports = {
  ...createDefaultPreset(getTsJestBaseConfig()),
  ...getOtterJestBaseConfig(rootDir),
  ...getJestUnitTestConfig({
    testPathIgnorePatterns: [
      '<rootDir>/src/.*'
    ]
  }),
  fakeTimers: {
    enableGlobally: true,
    // This is needed to prevent timeout on builders tests
    advanceTimers: true
  },
  setupFilesAfterEnv: ['<rootDir>/testing/setup-jest.builders.ts']
};
