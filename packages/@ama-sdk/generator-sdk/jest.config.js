/** @type {import('ts-jest/dist/types').JestConfigWithTsJest} */
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
