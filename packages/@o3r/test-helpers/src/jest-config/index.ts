import {
  existsSync,
  readFileSync,
} from 'node:fs';
import {
  dirname,
  relative,
  resolve,
} from 'node:path';
import {
  type JestConfigWithTsJest,
  pathsToModuleNameMapper,
  type TsJestTransformerOptions,
} from 'ts-jest';
import {
  parseConfigFileTextToJson,
} from 'typescript';

/**
 * Get Base config for TS-jest creation
 * @param options
 */
export const getTsJestBaseConfig = (options?: TsJestTransformerOptions): TsJestTransformerOptions => ({
  ...options,
  tsconfig: options?.tsconfig ?? '<rootDir>/tsconfig.spec.json',
  stringifyContentPathRegex: '\\.html$'
});

type OtterJestBaseConfigOptions = {
  baseTsconfig?: string;
  config?: JestConfigWithTsJest;
};

/**
 * Get Base config for TS-jest creation
 * @param rootDir Project root dir
 * @param options
 */
module.exports.getOtterJestBaseConfig = (rootDir: string, options: OtterJestBaseConfigOptions): JestConfigWithTsJest => {
  let baseTsconfigPath = options?.baseTsconfig;
  if (!baseTsconfigPath) {
    let currentPath = rootDir;
    let previousPath: string | undefined;
    while (currentPath !== previousPath && !baseTsconfigPath) {
      const file = resolve(currentPath, 'tsconfig.base.json');
      baseTsconfigPath = existsSync(file) ? file : undefined;
      previousPath = currentPath;
      currentPath = dirname(currentPath);
    }
  }

  let moduleNameMapper: Record<string, string[]> = {};

  if (baseTsconfigPath) {
    const { compilerOptions } = parseConfigFileTextToJson(
      baseTsconfigPath,
      readFileSync(baseTsconfigPath, { encoding: 'utf8' })
    ).config;
    const relativePath = relative(rootDir, dirname(baseTsconfigPath));
    moduleNameMapper = Object.fromEntries(
      Object.entries(pathsToModuleNameMapper(compilerOptions.paths || {}) as Record<string, any>)
        .map(([moduleName, paths]) => [moduleName, (Array.isArray(paths) ? paths : [paths]).map((path) => `<rootDir>/${relativePath}/${path}`)])
    );
  }

  return {
    ...options?.config,
    rootDir,
    coverageReporters: ['cobertura'],
    modulePathIgnorePatterns: [
      ...(options?.config?.modulePathIgnorePatterns || []),
      '<rootDir>/dist',
      '<rootDir>/src/package.json'
    ],
    moduleNameMapper,
    testEnvironmentOptions: {
      // workaround for the SDK Core1
      customExportConditions: ['require', 'node'],
      ...options?.config?.testEnvironmentOptions
    },
    fakeTimers: {
      enableGlobally: true,
      ...options?.config?.fakeTimers
    },
    workerIdleMemoryLimit: '700MB'
  };
};

/**
 * Get Base config for Unit Test
 * @param config Default Jest config to be merged
 */
export const getJestUnitTestConfig = (config?: JestConfigWithTsJest): JestConfigWithTsJest => {
  return {
    ...config,
    testMatch: [
      '<rootDir>/**/*.spec.ts',
      ...(config?.testMatch || [])
    ],
    testPathIgnorePatterns: [
      '<rootDir>/.*/templates/.*',
      '\\.it\\.spec\\.ts$',
      ...(config?.testPathIgnorePatterns || [])
    ],
    reporters: [
      'default',
      ['jest-junit', { outputDirectory: '<rootDir>/dist-test', outputName: 'junit.xml', classNameTemplate: '{filepath}' }],
      'github-actions'
    ]
  };
};

/**
 * Get Base config for Integration Test
 * @param config Default Jest config to be merged
 */
export const getJestIntegrationTestConfig = (config?: JestConfigWithTsJest): JestConfigWithTsJest => ({
  ...config,
  testPathIgnorePatterns: [
    '<rootDir>/.*/templates/.*',
    ...(config?.testPathIgnorePatterns || [])
  ],
  testMatch: [
    '<rootDir>/**/*.it.spec.ts',
    ...(config?.testMatch || [])
  ],
  reporters: [
    'default',
    ['jest-junit', { outputDirectory: '<rootDir>/dist-test', outputName: 'it-report.xml' }],
    'github-actions'
  ],
  testTimeout: 30 * 60 * 1000
});

/**
 * Jest configuration that can be set at root level
 */
export const getJestProjectConfig = (): JestConfigWithTsJest => {
  return {
    coverageReporters: ['cobertura'],
    reporters: [
      'default',
      ['jest-junit', { outputDirectory: '<rootDir>/dist-test', outputName: 'junit.xml', classNameTemplate: '{filepath}' }],
      'github-actions'
    ],
    testTimeout: 30_000,
    testMatch: [
      '<rootDir>/**/*.spec.ts'
    ],
    testPathIgnorePatterns: [
      '\\.spec\\.ts$'
    ]
  };
};
