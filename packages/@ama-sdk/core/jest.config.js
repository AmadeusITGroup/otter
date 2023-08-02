const { getJestModuleNameMapper } = require('@o3r/dev-tools');
const {resolve} = require('node:path');

/** @type {import('ts-jest/dist/types').JestConfigWithTsJest} */
module.exports = {
  displayName: require('./package.json').name,
  preset: 'ts-jest',
  rootDir: '.',
  moduleNameMapper: getJestModuleNameMapper(__dirname),
  setupFilesAfterEnv: ['<rootDir>/testing/setup-jest.ts'],
  modulePathIgnorePatterns: [
    '<rootDir>/dist'
  ],
  reporters: [
    'default',
    ['jest-junit', {outputDirectory: resolve(__dirname, '..', 'dist-test'), outputName: 'ut-report.xml'}],
    'github-actions'
  ],
  transform: {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.html$'
      }
    ]
  }
};
