const path = require('node:path');
const { getTsJestBaseConfig, getOtterJestBaseConfig, getJestIntegrationTestConfig } = require('@o3r/test-helpers');
const { createJsWithTsEsmPreset } = require('ts-jest');

const rootDir = path.join(__dirname, '..');

const tsJestConfig = { ...getTsJestBaseConfig(), useESM: true, diagnostics: { ignoreCodes: [151002] } };

/** @type {import('ts-jest/dist/types').JestConfigWithTsJest} */
module.exports = {
  ...createJsWithTsEsmPreset(tsJestConfig),
  ...getOtterJestBaseConfig(rootDir),
  ...getJestIntegrationTestConfig(),
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts', '.mts'],
  resolver: '<rootDir>/testing/jest-resolver.cjs',
  injectGlobals: true
};
