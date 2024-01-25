const { getJestProjects } = require('@o3r/workspace');

/** @type {import('ts-jest/dist/types').JestConfigWithTsJest} */
module.exports = {
  projects: [
    ...getJestProjects(__dirname),
    ...getJestProjects(__dirname, 'testing/jest.config.*.{j,t}s')
  ],
  globalSetup: 'jest-preset-angular/global-setup',
  reporters: [
    'default',
    'github-actions'
  ]
};
