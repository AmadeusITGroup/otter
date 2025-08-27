const { getJestProjectConfig } = require('@o3r/test-helpers');
const { getJestProjects } = require('@o3r/workspace');

/**
 * Workspace global jest configuration
 * Note: It is for IDE Test run and debugging purpose, you may want to run `yarn test` instead
 * @type {import('ts-jest/dist/types').JestConfigWithTsJest}
 */
module.exports = {
  ...getJestProjectConfig(),
  coverageReporters: undefined,
  reporters: undefined,
  projects: [
    ...getJestProjects(__dirname),
    ...getJestProjects(__dirname, 'testing/jest.config.{ut,ut.builders}.{m,c,}{j,t}s')
  ]
};
