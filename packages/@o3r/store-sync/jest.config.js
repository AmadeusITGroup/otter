const { getJestModuleNameMapper } = require('@o3r/dev-tools');

globalThis.ngJest = {
  skipNgcc: true
};

/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  displayName: require('./package.json').name,
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/testing/setup-jest.ts'],
  rootDir: '.',
  moduleNameMapper: getJestModuleNameMapper(__dirname),
  modulePathIgnorePatterns: [
    '<rootDir>/dist'
  ],
  testPathIgnorePatterns: [
    '<rootDir>/.*/templates/.*',
    '\\.it\\.spec\\.ts$'
  ],
  reporters: [
    'default',
    'github-actions'
  ],
  globalSetup: 'jest-preset-angular/global-setup',
  globals: {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
      stringifyContentPathRegex: '\\.html$'
    }
  },
  testEnvironmentOptions: {
    // workaround for the SDK Core
    customExportConditions: ['require', 'node']
  }
};
