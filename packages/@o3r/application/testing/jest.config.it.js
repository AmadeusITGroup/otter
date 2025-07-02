const { join } = require('node:path');
const getJestConfig = require('../../../../jest.config.it').getJestConfig;

/** @type {import('ts-jest/dist/types').JestConfigWithTsJest} */
module.exports = {
  ...getJestConfig(join(__dirname, '..')),
  displayName: require('../package.json').name
};
