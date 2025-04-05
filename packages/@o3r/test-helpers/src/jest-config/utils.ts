/**
 * Get dependency mapping for given testing environment
 * @param testingEnv
 */
export const getJestFixtureMapping = (testingEnv: 'angular' | 'playwright' | 'protractor'): Record<string, string[]> => {
  return {
    '^@o3r/testing/core$': [`<rootDir>/../../@o3r/testing/src/core/${testingEnv}`],
    '^@o3r/testing/core/(.*)$': [`<rootDir>/../../@o3r/testing/src/core/${testingEnv}/$1`]
  };
};
