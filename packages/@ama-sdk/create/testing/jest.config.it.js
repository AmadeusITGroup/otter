const getJestConfig = require('../../../../jest.config.it').getJestConfig;

/** @type {import('ts-jest/dist/types').JestConfigWithTsJest} */
module.exports = {
  ...getJestConfig(__dirname),
  displayName: require('../package.json').name
};
