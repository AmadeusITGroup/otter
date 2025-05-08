const { getJestProjectConfig } = require('@o3r/test-helpers');

/** @type {import('ts-jest/dist/types').JestConfigWithTsJest} */
module.exports = {
  ...getJestProjectConfig(),
  projects: [
    '<rootDir>/testing/jest.config.ut.js',
    '<rootDir>/testing/jest.config.ut.builders.js'
  ]
};
