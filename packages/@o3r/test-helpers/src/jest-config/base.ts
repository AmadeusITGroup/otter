import {
  existsSync,
  readFileSync,
} from 'node:fs';
import {
  dirname,
  relative,
  resolve,
} from 'node:path';
import defaultTransformerOptions from 'jest-preset-angular/presets';
import {
  type JestConfigWithTsJest,
  pathsToModuleNameMapper,
  type TsJestTransformerOptions,
} from 'ts-jest';
import type {
  PackageJson,
} from 'type-fest';
import {
  parseConfigFileTextToJson,
} from 'typescript';

export const getAngularJestConfig = () => {
  return {
        preset: 'jest-preset-angular',
        transform: {
      '^.+\\.(ts|mts|js|mjs|html|svg)$': [
        'jest-preset-angular',
        {
          ...defaultTransformerOptions,
          ...getTsJestBaseConfig()
        },
      ],
    }
  }
}

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
  moduleNameMapper?: Record<string, string[]>;
};

/**
 * Get Base config for TS-jest creation
 * @param rootDir Project root dir
 * @param options
 */
export const getOtterJestBaseConfig = (rootDir: string, options: OtterJestBaseConfigOptions): JestConfigWithTsJest => {
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
    const relativePath = relative(rootDir, dirname(baseTsconfigPath)).replaceAll('\\', '/');
    moduleNameMapper = Object.fromEntries(
      Object.entries(pathsToModuleNameMapper(compilerOptions.paths || {}) as Record<string, any>)
        .map(([moduleName, paths]) => [moduleName, (Array.isArray(paths) ? paths : [paths]).map((path) => `<rootDir>/${relativePath}/${path}`)])
    );
  }
  const packageJsonPath = resolve(rootDir, 'package.json');
  const displayName = existsSync(packageJsonPath) && (JSON.parse(readFileSync(packageJsonPath, 'utf8')) as PackageJson).name;

  return {
    ...options?.config,
    ...(displayName ? { displayName } : {}),
    rootDir,
    coverageReporters: ['cobertura'],
    modulePathIgnorePatterns: [
      ...(options?.config?.modulePathIgnorePatterns || []),
      '<rootDir>/dist',
      '<rootDir>/src/package.json'
    ],
    extensionsToTreatAsEsm: ['.ts', '.mts'],
    moduleNameMapper: {
      ...moduleNameMapper,
      '^(\\.{1,2}/.*)\\.mjs$': ['$1.mjs', '$1.mts'],
      ...options?.config?.moduleNameMapper
    },
    testEnvironmentOptions: {
      // workaround for the SDK Core1
      customExportConditions: ['require', 'node'],
      ...options?.config?.testEnvironmentOptions
    },
    workerIdleMemoryLimit: '700MB'
  };
};

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
    passWithNoTests: true,
    testPathIgnorePatterns: [
      '.*'
    ]
  };
};
