const getJestProjectConfig = require('../../jest.config.ut').getJestProjectConfig;

const baseConfig = getJestProjectConfig(__dirname, false);

/** @type {import('ts-jest/dist/types').JestConfigWithTsJest} */
module.exports = {
  ...baseConfig,
  displayName: require('./package.json').name
};
