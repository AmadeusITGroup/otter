/** @type {import('ts-jest/dist/types').JestConfigWithTsJest} */
const {resolve} = require('node:path');
module.exports = {
  displayName: require('./package.json').name,
  preset: 'ts-jest',
  rootDir: '.',
  testPathIgnorePatterns: [
    '<rootDir>/.*/templates/.*',
    '\\.it\\.spec\\.ts$'
  ],
  modulePathIgnorePatterns: ['<rootDir>/.*/templates/.*'],
  setupFilesAfterEnv: ['<rootDir>/testing/setup-jest.ts'],
  reporters: [
    'default',
    ['jest-junit', {outputDirectory: resolve(__dirname, 'dist-test'), outputName: 'ut-report.xml'}],
    'github-actions'
  ],
  fakeTimers: {
    // TODO enable fake timers
    // enableGlobally: true
  },
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
