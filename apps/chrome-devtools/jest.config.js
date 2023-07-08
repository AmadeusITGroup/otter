const { getJestModuleNameMapper } = require('@o3r/dev-tools');

globalThis.ngJest = {
  skipNgcc: true
};

/** @type {import('ts-jest/dist/types').JestConfigWithTsJest} */
module.exports = {
  displayName: require('./package.json').name,
  preset: 'jest-preset-angular',
  rootDir: '.',
  setupFilesAfterEnv: ['<rootDir>/testing/setup-jest.ts'],
  transformIgnorePatterns: ['^.+\\.js$'],
  moduleNameMapper: getJestModuleNameMapper(__dirname),
  modulePathIgnorePatterns: [
    '<rootDir>/dist'
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
    },
    chrome: {
      runtime: {},
      devtools: {
        inspectedWindow: {}
      }
    }
  }
};
