const path = require('node:path');
const { getOtterJestBaseConfig, getJestUnitTestConfig, getTsJestBaseConfig } = require('@o3r/test-helpers');
const { createJsWithTsEsmPreset } = require('ts-jest');

const rootDir = path.join(__dirname, '..');

const tsJestConfig = { ...getTsJestBaseConfig(), useESM: true, diagnostics: { ignoreCodes: [151002] } };

/** @type {import('ts-jest/dist/types').JestConfigWithTsJest} */
module.exports = {
  ...createJsWithTsEsmPreset(tsJestConfig),
  ...getOtterJestBaseConfig(rootDir),
  ...getJestUnitTestConfig({
    testEnvironment: 'node',
    setupFilesAfterEnv: ['<rootDir>/testing/setup-jest.mjs'],
    extensionsToTreatAsEsm: ['.ts', '.mts'],
    resolver: '<rootDir>/testing/jest-resolver.cjs',
    injectGlobals: true,
    transformIgnorePatterns: [
      'node_modules/(?!(stylelint)/)'
    ]
  })
};
