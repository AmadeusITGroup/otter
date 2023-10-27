const getJestConfig = require('../../../jest.config.ut').getJestConfig;

/** @type {import('ts-jest/dist/types').JestConfigWithTsJest} */
module.exports = {
  ...getJestConfig(__dirname, true),
  displayName: require('./package.json').name,
  testPathIgnorePatterns: [
    '<rootDir>/.*/templates/.*',
    '\\.it\\.spec\\.ts$'
  ],
  fakeTimers: {
    enableGlobally: true,
    // TODO try to make date utils work with fake Date
    doNotFake: ['Date']
  }
};
