const path = require('node:path');
const { getOtterJestBaseConfig, getJestUnitTestConfig } = require('@o3r/test-helpers');

const rootDir = path.join(__dirname, '..');

/** @type {import('ts-jest/dist/types').JestConfigWithTsJest} */
module.exports = {
  ...getOtterJestBaseConfig(rootDir),
  ...getJestUnitTestConfig(),
  transform: {
    '^.+\\.([mc]?[tj]sx?)$': ['babel-jest', { configFile: path.join(__dirname, 'babel.config.mjs') }]
  },
  extensionsToTreatAsEsm: ['.mts'],
  setupFilesAfterEnv: ['<rootDir>/testing/setup-jest.ts']
};
