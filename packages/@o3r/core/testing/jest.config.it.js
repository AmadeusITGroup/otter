const path = require('node:path');
const { getDefaultTsJestCjsPreset, getOtterJestBaseConfig, getJestIntegrationTestConfig } = require('@o3r/test-helpers');

const rootDir = path.join(__dirname, '..');

/** @type {import('ts-jest/dist/types').JestConfigWithTsJest} */
module.exports = {
  ...getDefaultTsJestCjsPreset(),
  ...getOtterJestBaseConfig(rootDir),
  ...getJestIntegrationTestConfig()
};
