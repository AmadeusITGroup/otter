const { join, relative } = require('node:path');
const { pathsToModuleNameMapper } = require('ts-jest');
// In the following statement, replace `./tsconfig.json` with the path to your `tsconfig` file
// which contains the path mapping (ie the `compilerOptions.paths` option):
const { compilerOptions } = require('./tsconfig.json');

globalThis.ngJest = {
  skipNgcc: true
};

/**
 * @param rootDir {string}
 * @param isAngularSetup {boolean}
 * @returns {import('ts-jest/dist/types').JestConfigWithTsJest}
 */
module.exports.getJestProjectConfig = (rootDir, isAngularSetup) => {
  const relativePath = relative(rootDir, __dirname);
  const moduleNameMapper = Object.entries(pathsToModuleNameMapper(compilerOptions.paths || {})).reduce((acc, [moduleName, path]) => {
    acc[moduleName] = `<rootDir>/${relativePath}/${path}`;
    return acc;
  }, {});
  moduleNameMapper['^@o3r/testing/core$'] = [require.resolve('@o3r/testing/core/angular')];
  moduleNameMapper['^@o3r/testing/core/(.*)'] = [join(require.resolve('@o3r/testing/core/angular'), '$1')];
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
};

module.exports.getJestGlobalConfig = () => {
  return {
    reporters: [
      'default',
      ['jest-junit', {outputDirectory: '<rootDir>/dist-test', outputName: 'ut-report.xml'}],
      'github-actions'
    ],
  }
}
