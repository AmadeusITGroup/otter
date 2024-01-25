const getJestGlobalConfig = require('../../../../jest.config.ut').getJestGlobalConfig;

/** @type {import('ts-jest/dist/types').JestConfigWithTsJest} */
module.exports = {
  ...getJestGlobalConfig(),
  projects: [
    '<rootDir>/testing/jest.config.ut.js'
  ]
};
