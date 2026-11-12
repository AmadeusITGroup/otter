const path = require('node:path');
const { getDefaultTsJestCjsPreset, getOtterJestBaseConfig, getJestUnitTestConfig } = require('@o3r/test-helpers');

const rootDir = path.join(__dirname, '..');

/** @type {import('ts-jest/dist/types').JestConfigWithTsJest} */
module.exports = {
  ...getDefaultTsJestCjsPreset(),
  ...getOtterJestBaseConfig(rootDir),
  ...getJestUnitTestConfig({
    testPathIgnorePatterns: [
      '<rootDir>/.*/templates/.*',
      '<rootDir>/src/.*',
      '\\.it\\.spec\\.ts$'
    ]
  }),
  setupFilesAfterEnv: ['<rootDir>/testing/setup-jest.builders.ts']
};
