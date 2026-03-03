const path = require('node:path');
const { getTsJestBaseConfig, getOtterJestBaseConfig, getJestUnitTestConfig } = require('@o3r/test-helpers');
const { createDefaultPreset } = require('ts-jest');

const rootDir = path.join(__dirname, '..');

/** @type {import('ts-jest/dist/types').JestConfigWithTsJest} */
module.exports = {
  ...createDefaultPreset(getTsJestBaseConfig()),
  ...getOtterJestBaseConfig(rootDir, {
    config: {
      fakeTimers: {
        advanceTimers: true
      }
    }
  }),
  ...getJestUnitTestConfig({
    testPathIgnorePatterns: [
      '<rootDir>/schematics/.*',
      '\\.it\\.spec\\.ts$'
    ]
  })
};
