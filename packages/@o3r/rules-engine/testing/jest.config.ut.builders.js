const path = require('node:path');
const getJestProjectConfig = require('../../../../jest.config.ut').getJestProjectConfig;
const rootDir = path.join(__dirname, '..');

/** @type {import('ts-jest/dist/types').JestConfigWithTsJest} */
module.exports = {
  ...getJestProjectConfig(rootDir, false),
  displayName: `${require('../package.json').name}/builders`,
  rootDir,
  setupFilesAfterEnv: ['<rootDir>/testing/setup-jest.builders.ts'],
  fakeTimers: {
    enableGlobally: true,
    // This is needed to prevent timeout on builders tests
    advanceTimers: true
  },
  testPathIgnorePatterns: [
    '<rootDir>/.*/(?:mocks|templates)/.*',
    '<rootDir>/src/.*',
    '\\.it\\.spec\\.ts$'
  ]
};
