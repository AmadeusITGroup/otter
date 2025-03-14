const path = require('node:path');
const getJestProjectConfig = require('../../../../jest.config.ut').getJestProjectConfig;

const rootDir = path.join(__dirname, '..');

/** @type {import('ts-jest/dist/types').JestConfigWithTsJest} */
module.exports = {
  ...getJestProjectConfig(rootDir, false),
  displayName: require('../package.json').name,
  rootDir,
  fakeTimers: {
    enableGlobally: true,
    advanceTimers: true
  },
  testPathIgnorePatterns: [
    '<rootDir>/.*/templates/.*',
    '<rootDir>/schematics/.*',
    '\\.it\\.spec\\.ts$'
  ]
};
