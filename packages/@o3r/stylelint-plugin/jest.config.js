const {resolve} = require('node:path');

/** @type {import('ts-jest/dist/types').JestConfigWithTsJest} */
module.exports = {
  displayName: require('./package.json').name,
  preset: 'ts-jest',
  setupFiles: ['<rootDir>/testing/jest.setup.ts'],
  testEnvironment: 'node',
  rootDir: '.',
  transform: {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.html$',
      }
    ]
  },
  reporters: [
    'default',
    ['jest-junit', {outputDirectory: resolve(__dirname, 'dist-test'), outputName: 'ut-report.xml'}],
    'github-actions'
  ]
};
