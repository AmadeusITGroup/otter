const path = require('node:path');
const { getTsJestBaseConfig, getOtterJestBaseConfig, getJestUnitTestConfig } = require('@o3r/test-helpers');
const { createCjsPreset } = require('jest-preset-angular/presets');

const rootDir = path.join(__dirname, '..');

/** @type {import('ts-jest/dist/types').JestConfigWithTsJest} */
module.exports = {
  ...createCjsPreset(getTsJestBaseConfig()),
  ...getOtterJestBaseConfig(rootDir),
  ...getJestUnitTestConfig({
    testPathIgnorePatterns: [
      '<rootDir>/.*/(?:mocks|templates)/.*',
      '<rootDir>/builders/.*',
      '<rootDir>/schematics/.*'
    ]
  }),
  setupFilesAfterEnv: ['<rootDir>/testing/setup-jest.ts']
};
