const { getJestModuleNameMapper } = require('@o3r/dev-tools');

/** @type {import('ts-jest/dist/types').JestConfigWithTsJest} */
module.exports = {
  displayName: require('./package.json').name,
  preset: 'ts-jest',
  setupFilesAfterEnv: ['<rootDir>/testing/setup-jest.ts'],
  rootDir: '.',
  moduleNameMapper: getJestModuleNameMapper(__dirname),
  testPathIgnorePatterns: [
    '<rootDir>/dist',
    '<rootDir>/.*/templates/.*',
    '\\.it\\.spec\\.ts$'
  ],
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
