const path = require('node:path');
const getJestProjectConfig = require('../../../../jest.config.ut').getJestProjectConfig;
const rootDir = path.join(__dirname, '..');

/** @type {import('ts-jest/dist/types').JestConfigWithTsJest} */
module.exports = {
  ...getJestProjectConfig(rootDir, false),
  displayName: require('../package.json').name,
  rootDir,
  moduleNameMapper: {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '^@o3r-training/showcase-sdk$': ['<rootDir>/dist/cjs', '<rootDir>/src'],
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '^@o3r-training/showcase-sdk/(.*)$': ['<rootDir>/dist/cjs/$1', '<rootDir>/src/$1']
  }
};
