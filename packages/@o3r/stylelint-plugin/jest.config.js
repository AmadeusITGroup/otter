const getJestConfig = require('../../../jest.config.ut').getJestConfig;

/** @type {import('ts-jest/dist/types').JestConfigWithTsJest} */
module.exports = {
  ...getJestConfig(__dirname, false),
  displayName: require('./package.json').name,
  preset: 'jest-preset-stylelint',
  setupFilesAfterEnv: null,
  testEnvironment: 'node'
};
