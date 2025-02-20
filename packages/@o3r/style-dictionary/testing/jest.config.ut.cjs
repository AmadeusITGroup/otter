const path = require('node:path');
const getJestProjectConfig = require('../../../../jest.config.ut').getJestProjectConfig;

const rootDir = path.join(__dirname, '..');

const baseConfig = getJestProjectConfig(rootDir, false);

/** @type {import('ts-jest/dist/types').JestConfigWithTsJest} */
module.exports = {
  ...baseConfig,
  displayName: require('../package.json').name,
  resolver: '<rootDir>/testing/mjs-resolver.cjs',
  testEnvironmentOptions: {
    // workaround to use stylelint CommonJs interface
    customExportConditions: ['require']
  },
  transform: {
    '^.+\\.([mc]?[tj]sx?)$': ['babel-jest', { configFile: path.join(__dirname, 'babel.config.mjs') }]
  },
  extensionsToTreatAsEsm: ['.mts']
};
