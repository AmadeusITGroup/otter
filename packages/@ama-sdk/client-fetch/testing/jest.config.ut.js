const path = require('node:path');
const { getDefaultTsJestCjsPreset, getOtterJestBaseConfig, getJestUnitTestConfig } = require('@o3r/test-helpers');

const rootDir = path.join(__dirname, '..');

/** @type {import('ts-jest/dist/types').JestConfigWithTsJest} */
module.exports = {
  ...getDefaultTsJestCjsPreset(),
  ...getOtterJestBaseConfig(rootDir),
  ...getJestUnitTestConfig({
    testPathIgnorePatterns: [
      '<rootDir>/builders/.*',
      '<rootDir>/schematics/.*'
    ]
  }),
  fakeTimers: {
    enableGlobally: true
  },
  setupFilesAfterEnv: ['<rootDir>/testing/setup-jest.ts']
};
