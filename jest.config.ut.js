const { relative } = require('node:path');
const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig.base');

globalThis.ngJest = {
  skipNgcc: true
};

/**
 * Jest configuration that can be set at project level
 * @param rootDir {string}
 * @param isAngularSetup {boolean}
 * @returns {import('ts-jest/dist/types').JestConfigWithTsJest}
 */
module.exports.getJestProjectConfig = (rootDir, isAngularSetup) => {
  const relativePath = relative(rootDir, __dirname);
  const moduleNameMapper = Object.fromEntries(
    Object.entries(pathsToModuleNameMapper(compilerOptions.paths))
      .map(([moduleName, path]) => [moduleName, `<rootDir>/${relativePath}/${path}`])
  );
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
    fakeTimers: {
      enableGlobally: true
    },
    transform: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      '^.+\\.[mc]?tsx?$': [
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

/**
 * Jest configuration that can be set at root level
 * @returns {import('ts-jest/dist/types').JestConfigWithTsJest}
 */
module.exports.getJestGlobalConfig = () => {
  return {
    testTimeout: 30000,
    reporters: [
      'default',
      ['jest-junit', {outputDirectory: '<rootDir>/dist-test', outputName: 'ut-report.xml'}],
      'github-actions'
    ],
  }
}
