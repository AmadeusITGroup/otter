const path = require('node:path');
const getJestProjectConfig = require('../../../../jest.config.ut').getJestProjectConfig;

const rootDir = path.join(__dirname, '..');

const baseConfig = getJestProjectConfig(rootDir, false);

/** @type {import('ts-jest/dist/types').JestConfigWithTsJest} */
module.exports = {
  ...baseConfig,
  displayName: `${require('../package.json').name}/builders`,
  setupFilesAfterEnv: ['<rootDir>/testing/setup-jest.builders.ts'],
  fakeTimers: {
    ...baseConfig.fakeTimers,
    // This is needed to prevent timeout on builders tests
    advanceTimers: true
  },
  testPathIgnorePatterns: [
    ...baseConfig.testPathIgnorePatterns,
    '<rootDir>/src/.*'
  ]
};
