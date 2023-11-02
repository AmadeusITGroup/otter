const getJestConfig = require('../../jest.config.ut').getJestConfig;

/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  ...getJestConfig(__dirname, true),
  displayName: require('./package.json').name
};
