const { getDefaultTsJestCjsPreset, getOtterJestBaseConfig, getJestUnitTestConfig } = require('@o3r/test-helpers');

/** @type {import('ts-jest/dist/types').JestConfigWithTsJest} */
module.exports = {
  ...getDefaultTsJestCjsPreset(),
  ...getOtterJestBaseConfig(__dirname),
  ...getJestUnitTestConfig()
};
