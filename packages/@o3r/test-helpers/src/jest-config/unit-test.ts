import type {
  JestConfigWithTsJest,
} from 'ts-jest';

/**
 * Get Base config for Unit Test
 * @param config Default Jest config to be merged
 */
export const getJestUnitTestConfig = (config?: JestConfigWithTsJest): JestConfigWithTsJest => {
  return {
    ...config,
    testMatch: [
      '<rootDir>/**/*.spec.ts',
      ...(config?.testMatch || [])
    ],
    testPathIgnorePatterns: [
      '<rootDir>/.*/templates/.*',
      '\\.it\\.spec\\.ts$',
      ...(config?.testPathIgnorePatterns || [])
    ],
    reporters: [
      'default',
      ['jest-junit', { outputDirectory: '<rootDir>/dist-test', outputName: 'junit.xml', classNameTemplate: '{filepath}' }],
      'github-actions'
    ]
  };
};
