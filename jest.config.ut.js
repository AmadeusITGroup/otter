const { resolve, relative } = require('node:path');
const { readFileSync } = require('node:fs');
const { pathsToModuleNameMapper } = require('ts-jest');
const ts = require('typescript');

globalThis.ngJest = {
  skipNgcc: true
};

/**
 * Jest configuration that can be set at project level
 * @param rootDir {string}
 * @param isAngularSetup {boolean}
 * @param options.tsconfig {string}
 * @param options.baseTsconfig {string}
 * @returns {import('ts-jest/dist/types').JestConfigWithTsJest}
 */
module.exports.getJestProjectConfig = (rootDir, isAngularSetup, options) => {
  const baseTsconfigPath = options?.baseTsconfig ?? resolve(__dirname, './tsconfig.base.json');
  const { compilerOptions } = ts.parseConfigFileTextToJson(baseTsconfigPath, readFileSync(baseTsconfigPath, { encoding: 'utf-8' })).config;
  const relativePath = relative(rootDir, options?.baseTsconfig ? __dirname(options.baseTsconfig) : __dirname);
  const moduleNameMapper = Object.fromEntries(
    Object.entries(pathsToModuleNameMapper(compilerOptions.paths))
      .map(([moduleName, path]) => [moduleName, `<rootDir>/${relativePath}/${path}`])
  );
  return {
    preset: 'ts-jest',
    setupFilesAfterEnv: ['<rootDir>/testing/setup-jest.ts'],
    rootDir,
    moduleNameMapper,
    modulePathIgnorePatterns: [
      '<rootDir>/dist',
      '<rootDir>/src/package.json'
    ],
    testMatch: [
      '<rootDir>/**/*.spec.ts'
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
          tsconfig: options?.tsconfig ?? '<rootDir>/tsconfig.spec.json',
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
            tsconfig: options?.tsconfig ?? '<rootDir>/tsconfig.spec.json',
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
module.exports.getJestGlobalConfig = (rootDir) => {
  return {
    testTimeout: 30000,
    coverageReporters: ['cobertura'],
    reporters: [
      'default',
      ['jest-junit', { outputDirectory: '<rootDir>/dist-test', outputName: 'junit.xml', classNameTemplate: '{filepath}' }],
      'github-actions'
    ],
    rootDir,
    testMatch: [
      '<rootDir>/**/*.spec.ts'
    ],
    testPathIgnorePatterns: [
      '\\.spec\\.ts$'
    ]
  }
}
