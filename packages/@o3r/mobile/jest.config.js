const getJestConfig = require('../../../jest.config.ut').getJestConfig;

/** @type {import('ts-jest/dist/types').JestConfigWithTsJest} */
module.exports = {
  ...getJestConfig(__dirname, true),
  displayName: require('./package.json').name,
  transformIgnorePatterns: ['^.+\\.js$'],
  testPathIgnorePatterns: [
    '\\.it\\.spec\\.ts$'
  ]
};
