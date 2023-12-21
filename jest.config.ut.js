const { relative } = require('node:path');
const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig.base');

globalThis.ngJest = {
  skipNgcc: true
};

/**
 * @param rootDir {string}
 * @param isAngularSetup {boolean}
 * @returns {import('ts-jest/dist/types').JestConfigWithTsJest}
 */
module.exports.getJestConfig = (rootDir, isAngularSetup) => {
  const relativePath = relative(rootDir, '.');
  const moduleNameMapper = Object.entries(pathsToModuleNameMapper(compilerOptions.paths)).reduce((acc, [moduleName, path]) => {
    acc[moduleName] = `<rootDir>/${relativePath}/${path}`;
    return acc;
  }, {});
  return {
    preset: 'ts-jest',
    setupFilesAfterEnv: ['<rootDir>/testing/setup-jest.ts'],
    rootDir: '.',
    moduleNameMapper,
    modulePathIgnorePatterns: [
      '<rootDir>/dist'
    ],
    testPathIgnorePatterns: [
      '<rootDir>/.*/templates/.*',
      '\\.it\\.spec\\.ts$'
    ],
    reporters: [
      'default',
      ['jest-junit', {outputDirectory: '<rootDir>/dist-test', outputName: 'ut-report.xml'}],
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
          stringifyContentPathRegex: '\\.html$'
        }
      ]
    },
    testEnvironmentOptions: {
      // workaround for the SDK Core
      customExportConditions: ['require', 'node']
    },
    testTimeout: 15000,
    workerIdleMemoryLimit: '700MB',
    ...isAngularSetup ? {
      preset: 'jest-preset-angular',
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
      globalSetup: 'jest-preset-angular/global-setup',
    } : {}
  };
}
