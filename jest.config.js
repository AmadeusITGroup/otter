const { getJestProjects } = require('@o3r/workspace');
const { getJestGlobalConfig } = require('./jest.config.ut');

/**
 * Workspace global jest configuration
 * Note: It is for IDE Test run and debugging purpose, you may want to run `yarn test` instead
 * @type {import('ts-jest/dist/types').JestConfigWithTsJest}
 **/
module.exports = {
  ...getJestGlobalConfig(__dirname),
  coverageReporters: undefined,
  reporters: undefined,
  passWithNoTests: true,
  projects: [
    ...getJestProjects(__dirname),
    ...getJestProjects(__dirname, 'testing/jest.config.{ut,ut.builders}.{j,t}s')
  ],
  globalSetup: 'jest-preset-angular/global-setup'
};
