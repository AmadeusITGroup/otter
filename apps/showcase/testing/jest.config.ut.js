const path = require('node:path');
const { getTsJestBaseConfig, getOtterJestBaseConfig, getJestUnitTestConfig } = require('@o3r/test-helpers');
const { createCjsPreset } = require('jest-preset-angular/presets');

const rootDir = path.join(__dirname, '..');

/** @type {import('ts-jest/dist/types').JestConfigWithTsJest} */
module.exports = {
  ...createCjsPreset(getTsJestBaseConfig()),
  ...getOtterJestBaseConfig(rootDir),
  ...getJestUnitTestConfig(),
  setupFilesAfterEnv: ['<rootDir>/testing/setup-jest.ts'],
  coveragePathIgnorePatterns: [
    '<rootDir>/dev-resources/',
    '<rootDir>/training-assets/'
  ],
  transformIgnorePatterns: [
    'node_modules/(?!.*\\.mjs$|parse5|jsdom|marked|ngx-markdown)'
  ]
};
