const { getJestProjects } = require('@o3r/workspace');

/** @type {import('ts-jest/dist/types').JestConfigWithTsJest} */
module.exports = {
  projects: getJestProjects(__dirname),
  globalSetup: 'jest-preset-angular/global-setup',
  reporters: [
    'default',
    'github-actions'
  ]
};
