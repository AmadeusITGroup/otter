const path = require('node:path');
const { getTsJestBaseConfig, getOtterJestBaseConfig, getJestIntegrationTestConfig } = require('@o3r/test-helpers');
const { createDefaultPreset } = require('ts-jest');

const rootDir = path.join(__dirname, '..');

/** @type {import('ts-jest/dist/types').JestConfigWithTsJest} */
module.exports = {
  ...createDefaultPreset(getTsJestBaseConfig({ tsconfig: '<rootDir>/tsconfig.it.spec.json' })),
  ...getOtterJestBaseConfig(rootDir),
  ...getJestIntegrationTestConfig(),
  setupFilesAfterEnv: ['<rootDir>/testing/setup-jest.builders.ts']
};
