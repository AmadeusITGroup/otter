const { getJestModuleNameMapper } = require('@o3r/dev-tools');

/** @type {import('ts-jest/dist/types').JestConfigWithTsJest} */
module.exports = {
  displayName: require('./package.json').name,
  preset: 'ts-jest',
  rootDir: '.',
  moduleNameMapper: getJestModuleNameMapper(__dirname),
  testPathIgnorePatterns: [
    '<rootDir>/.*/templates/.*',
    '\\.it\\.spec\\.ts$'
  ],
  reporters: [
    'default',
    'github-actions'
  ],
  globals: {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
      stringifyContentPathRegex: '\\.html$'
    }
  }
};
