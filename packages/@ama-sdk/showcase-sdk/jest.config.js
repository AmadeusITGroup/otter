const { getJestConfig } = require('../../../jest.config.ut');

/** @type {import('ts-jest/dist/types').JestConfigWithTsJest} */
module.exports = {
  ...getJestConfig(__dirname, false),
  displayName: require('./package.json').name,
  setupFilesAfterEnv: null,
  moduleNameMapper: {
    '^@ama-sdk/showcase-sdk$': ['<rootDir>/dist/cjs', '<rootDir>/src'],
    '^@ama-sdk/showcase-sdk/(.*)$': ['<rootDir>/dist/cjs/$1', '<rootDir>/src/$1'],
  }
};
