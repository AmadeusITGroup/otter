import type {
  JestConfigWithTsJest,
} from 'ts-jest';

/**
 * Get Base config for Integration Test
 * @param config Default Jest config to be merged
 */
export const getJestIntegrationTestConfig = (config?: JestConfigWithTsJest): JestConfigWithTsJest => ({
  ...config,
  testPathIgnorePatterns: [
    '<rootDir>/.*/templates/.*',
    ...(config?.testPathIgnorePatterns || [])
  ],
  testMatch: [
    '<rootDir>/**/*.it.spec.ts',
    ...(config?.testMatch || [])
  ],
  reporters: [
    'default',
    ['jest-junit', { outputDirectory: '<rootDir>/dist-test', outputName: 'it-report.xml' }],
    'github-actions'
  ],
  testTimeout: 30 * 60 * 1000
});
