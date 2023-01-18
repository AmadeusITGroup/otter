const { getJestProjects } = require('@o3r/dev-tools');

/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  projects: getJestProjects(__dirname),
  globalSetup: 'jest-preset-angular/global-setup',
  reporters: [
    'default',
    'github-actions'
  ]
};
