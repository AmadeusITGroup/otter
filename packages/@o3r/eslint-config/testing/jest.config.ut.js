const path = require('node:path');
const { getDefaultTsJestCjsPreset, getOtterJestBaseConfig, getJestUnitTestConfig } = require('@o3r/test-helpers');

const rootDir = path.join(__dirname, '..');

/** @type {import('ts-jest/dist/types').JestConfigWithTsJest} */
module.exports = {
  ...getDefaultTsJestCjsPreset(),
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
