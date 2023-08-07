const { getJestModuleNameMapper } = require('@o3r/dev-tools');
const {resolve} = require('node:path');

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
    ['jest-junit', {outputDirectory: resolve(__dirname, 'dist-test'), outputName: 'ut-report.xml'}],
    'github-actions'
  ],
  fakeTimers: {
    enableGlobally: true
  },
  globalSetup: 'jest-preset-angular/global-setup',
  transform: {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '^.+\\.tsx?$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.html$'
      }
    ]
  },
  globals: {
    chrome: {
      runtime: {},
      devtools: {
        inspectedWindow: {}
      }
    }
  }
};
