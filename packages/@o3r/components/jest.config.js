const { getJestModuleNameMapper } = require('@o3r/dev-tools');

/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  displayName: require('./package.json').name,
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/testing/setup-jest.ts'],
  rootDir: '.',
  moduleNameMapper: {
    '^@o3r/testing/core$': ['<rootDir>/../../@o3r/testing/src/core/angular'],
    '^@o3r/testing/core/(.*)$': ['<rootDir>/../../@o3r/testing/src/core/angular/$1'],
    ...getJestModuleNameMapper(__dirname),
  },
  testPathIgnorePatterns: [
    '<rootDir>/dist',
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
    // workaround for:
    // - uuid (see: https://github.com/microsoft/accessibility-insights-web/pull/5421#issuecomment-1109168149)
    customExportConditions: ['require', 'node']
  }
};
