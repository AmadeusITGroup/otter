const path = require('node:path');
const { getTsJestBaseConfig, getOtterJestBaseConfig, getJestUnitTestConfig } = require('@o3r/test-helpers');
const { createDefaultPreset } = require('ts-jest');

const rootDir = path.join(__dirname, '..');

/**
 * Retained Jest harness for schematic tests.
 *
 * Schematic tests load the Angular DevKit schematics collection through
 * CommonJS, which Vitest's ESM loader cannot resolve; these tests therefore
 * stay on Jest per the repository test-runner policy (see
 * docs/testing/TEST_RUNNER_POLICY.md). Scoped to `schematics/` so
 * repository-owned unit tests (under src/ and testing/) and builder tests keep
 * running on Vitest.
 * @type {import('ts-jest/dist/types').JestConfigWithTsJest}
 */
module.exports = {
  ...createDefaultPreset(getTsJestBaseConfig()),
  ...getOtterJestBaseConfig(rootDir),
  ...getJestUnitTestConfig(),
  roots: ['<rootDir>/schematics'],
  setupFilesAfterEnv: ['<rootDir>/testing/setup-jest.schematics.ts']
};
