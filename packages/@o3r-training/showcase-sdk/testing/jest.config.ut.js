const path = require('node:path');
const getJestProjectConfig = require('../../../../jest.config.ut').getJestProjectConfig;

const rootDir = path.join(__dirname, '..');

const baseConfig = getJestProjectConfig(rootDir, false);

/** @type {import('ts-jest/dist/types').JestConfigWithTsJest} */
module.exports = {
  ...baseConfig,
  displayName: require('../package.json').name,
  moduleNameMapper: {
    '^@o3r-training/showcase-sdk$': ['<rootDir>/dist/cjs', '<rootDir>/src'],
    '^@o3r-training/showcase-sdk/(.*)$': ['<rootDir>/dist/cjs/$1', '<rootDir>/src/$1']
  }
};
