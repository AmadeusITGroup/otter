const { resolve } = require('node:path');
const { getJestModuleNameMapper } = require('@o3r/dev-tools');

/** @type {import('ts-jest/dist/types').JestConfigWithTsJest} */
module.exports = {
  displayName: require('../package.json').name,
  preset: 'ts-jest',
  rootDir: '..',
  moduleNameMapper: getJestModuleNameMapper(resolve(__dirname, '..'), resolve(__dirname, '..', '..', '..', '..', 'tsconfig.base.json')),
  testPathIgnorePatterns: [
    '<rootDir>/.*/templates/.*'
  ],
  reporters: [
    'default',
    ['jest-junit', {outputDirectory: resolve(__dirname, '..', 'dist-test'), outputName: 'it-report.xml'}],
    'github-actions'
  ],
  globals: {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
      stringifyContentPathRegex: '\\.html$'
    }
  },
  testMatch: [
    '<rootDir>/**/*.it.spec.ts'
  ],
  testTimeout: 30 * 60 * 1000
};
