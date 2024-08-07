const { dirname } = require('node:path');
const getJestConfig = require('../../../../jest.config.it').getJestConfig;

/** @type {import('ts-jest/dist/types').JestConfigWithTsJest} */
module.exports = {
  ...getJestConfig(dirname(__dirname), { tsconfig: '<rootDir>/tsconfig.it.spec.json' }),
  displayName: require('../package.json').name
};
