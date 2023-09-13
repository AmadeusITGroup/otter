const getJestConfig = require('../../../jest.config.ut').getJestConfig;

/** @type {import('ts-jest/dist/types').JestConfigWithTsJest} */
module.exports = {
  ...getJestConfig(__dirname, false),
  passWithNoTests: true,
  displayName: require('./package.json').name,
  testPathIgnorePatterns: [
    '<rootDir>/.*/templates/.*',
    '\\.it\\.spec\\.ts$'
  ],
  fakeTimers: {
    // TODO enable fake timers, currently not working because of yeoman-test
    // enableGlobally: true
  }
};
