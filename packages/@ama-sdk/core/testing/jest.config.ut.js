const path = require('node:path');
const getJestProjectConfig = require('../../../../jest.config.ut').getJestProjectConfig;
const rootDir = path.join(__dirname, '..');

/** @type {import('ts-jest/dist/types').JestConfigWithTsJest} */
module.exports = {
  ...getJestProjectConfig(rootDir, false),
  displayName: require('../package.json').name,
  rootDir,
  fakeTimers: {
    enableGlobally: true,
    // TODO re-enable fake dates when issue fixed https://github.com/sinonjs/fake-timers/issues/437
    doNotFake: ['Date']
  },
  globalSetup: '<rootDir>/testing/global-timezone-setup.js',
  testPathIgnorePatterns: [
    '<rootDir>/.*/templates/.*',
    '<rootDir>/builders/.*',
    '<rootDir>/schematics/.*',
    '\\.it\\.spec\\.ts$'
  ]
};
