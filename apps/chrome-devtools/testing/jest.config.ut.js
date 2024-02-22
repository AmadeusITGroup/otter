const path = require('node:path');
const getJestProjectConfig = require('../../../jest.config.ut').getJestProjectConfig;
const rootDir = path.join(__dirname, '..');

/** @type {import('ts-jest/dist/types').JestConfigWithTsJest} */
module.exports = {
  ...getJestProjectConfig(rootDir, true),
  displayName: require('../package.json').name,
  rootDir,
  transformIgnorePatterns: ['^.+\\.js$'],
  globals: {
    chrome: {
      runtime: {},
      devtools: {
        inspectedWindow: {}
      }
    }
  }
};
