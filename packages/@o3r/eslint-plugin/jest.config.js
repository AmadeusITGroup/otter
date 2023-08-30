/** @type {import('ts-jest/dist/types').JestConfigWithTsJest} */
const {resolve} = require('node:path');
module.exports = {
  displayName: require('./package.json').name,
  preset: 'ts-jest',
  rootDir: '.',
  modulePathIgnorePatterns: [
    '<rootDir>/dist'
  ],
  reporters: [
    'default',
    ['jest-junit', {outputDirectory: resolve(__dirname, 'dist-test'), outputName: 'ut-report.xml'}],
    'github-actions'
  ],
  fakeTimers: {
    enableGlobally: true
  },
  transform: {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.html$',
      }
    ]
  }
};
