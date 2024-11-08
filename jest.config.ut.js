const { readFileSync } = require('node:fs');
const { resolve, relative } = require('node:path');
const { pathsToModuleNameMapper } = require('ts-jest');
const ts = require('typescript');

globalThis.ngJest = {
  skipNgcc: true
};

/**
 * Jest configuration that can be set at project level
 * @param {string} rootDir
 * @param {boolean} isAngularSetup
 * @param {{ tsconfig: string; baseTsconfig: string; }} options
 * @returns {import('ts-jest/dist/types').JestConfigWithTsJest}
 */
module.exports.getJestProjectConfig = (rootDir, isAngularSetup, options) => {
  const baseTsconfigPath = options?.baseTsconfig ?? resolve(__dirname, './tsconfig.base.json');
  const { compilerOptions } = ts.parseConfigFileTextToJson(
    baseTsconfigPath,
    readFileSync(baseTsconfigPath, { encoding: 'utf8' })
  ).config;
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
    ...(isAngularSetup
      ? {
        preset: 'jest-preset-angular',
        transform: {
          '^.+\\.tsx?$': [
            'jest-preset-angular',
            {
              tsconfig: options?.tsconfig ?? '<rootDir>/tsconfig.spec.json',
              stringifyContentPathRegex: '\\.html$'
            }
          ]
        },
        globalSetup: 'jest-preset-angular/global-setup'
      }
      : {})
  };
};

/**
 * Jest configuration that can be set at root level
 * @param rootDir
 * @returns {import('ts-jest/dist/types').JestConfigWithTsJest}
 */
module.exports.getJestGlobalConfig = (rootDir) => {
  return {
    testTimeout: 30_000,
    coverageReporters: ['cobertura'],
    reporters: [
      'default',
      ['jest-junit', { outputDirectory: '<rootDir>/dist-test', outputName: 'ut-report.xml' }],
      'github-actions'
    ],
    rootDir,
    testMatch: [
      '<rootDir>/**/*.spec.ts'
    ],
    testPathIgnorePatterns: [
      '\\.spec\\.ts$'
    ]
  };
};
