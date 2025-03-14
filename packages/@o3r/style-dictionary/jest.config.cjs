const { getJestProjectConfig, getOtterJestBaseConfig } = require('@o3r/test-helpers');

/** @type {import('ts-jest/dist/types').JestConfigWithTsJest} */
module.exports = {
  ...getOtterJestBaseConfig(__dirname),
  ...getJestProjectConfig(),
  projects: [
    '<rootDir>/testing/jest.config.ut.cjs'
  ]
};
