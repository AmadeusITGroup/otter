const { getJestModuleNameMapper } = require('@o3r/dev-tools');
const {resolve} = require('node:path');

globalThis.ngJest = {
  skipNgcc: true
};

/** @type {import('ts-jest/dist/types').JestConfigWithTsJest} */
module.exports = {
  displayName: require('./package.json').name,
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/testing/setup-jest.ts'],
  rootDir: '.',
  moduleNameMapper: {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '^@o3r/testing/core$': ['<rootDir>/../../@o3r/testing/src/core/angular'],
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '^@o3r/testing/core/(.*)$': ['<rootDir>/../../@o3r/testing/src/core/angular/$1'],
    ...getJestModuleNameMapper(__dirname)
  },
  testPathIgnorePatterns: [
    '<rootDir>/dist',
    '<rootDir>/.*/templates/.*',
    '\\.it\\.spec\\.ts$'
  ],
  reporters: [
    'default',
    ['jest-junit', {outputDirectory: resolve(__dirname, 'dist-test'), outputName: 'ut-report.xml'}],
    'github-actions'
  ],
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
  testEnvironmentOptions: {
    // workaround for:
    // - uuid (see: https://github.com/microsoft/accessibility-insights-web/pull/5421#issuecomment-1109168149)
    customExportConditions: ['require', 'node']
  }
};
