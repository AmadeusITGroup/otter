#!/usr/bin/env node

import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import {
  dirname,
  join,
  relative,
  resolve,
  sep,
} from 'node:path';
import {
  fileURLToPath,
} from 'node:url';
import {
  globbySync,
} from 'globby';
import {
  applyEdits,
  modify,
} from 'jsonc-parser';

const RUNTIME_METHODS = [
  'advanceTimersByTime',
  'advanceTimersByTimeAsync',
  'clearAllMocks',
  'fn',
  'mock',
  'resetAllMocks',
  'resetModules',
  'restoreAllMocks',
  'runAllTimers',
  'runAllTimersAsync',
  'spyOn',
  'useFakeTimers',
  'useRealTimers'
];
const VITEST_DEPENDENCIES = {
  '@analogjs/vite-plugin-angular': '2.6.0',
  '@analogjs/vitest-angular': '2.6.0',
  '@nx/vitest': '~23.1.0',
  '@vitest/coverage-istanbul': '^4.0.18',
  '@vitest/eslint-plugin': '~1.0.0',
  ora: '9.4.0',
  vitest: '~4.1.0'
};
const JSON_FORMAT = {
  formattingOptions: {
    insertSpaces: true,
    tabSize: 2,
    eol: '\n'
  }
};

/**
 * Reports whether a path is protected from test-source conversion.
 * @param {string} path Workspace-relative path.
 * @returns {boolean} Whether the path belongs to a retained Jest boundary.
 */
export const isProtectedTestPath = (path) => path.includes('/templates/')
  || path.includes('/src/fixtures/')
  || path.includes('/fixture/jest/')
  || path.endsWith('.it.spec.ts')
  || path.endsWith('.jest.fixture.ts');

/**
 * Converts supported Jest runtime, `requireActual`, and namespace-type
 * references to Vitest.
 * @param {string} source Test source.
 * @returns {{source: string, changed: boolean}} Converted source and change flag.
 */
export const transformTestSource = (source) => {
  let transformed = source;
  for (const method of RUNTIME_METHODS) {
    transformed = transformed.replace(new RegExp(`\\bjest\\.${method}\\b`, 'g'), `vi.${method}`);
  }
  if (/\bjest\.requireActual\(/.test(transformed)) {
    transformed = transformed
      .replace(
        /\bjest\.requireActual\((['"])([^'"]+)\1\)/g,
        (_match, quote, moduleName) => `await vi.importActual<typeof import(${quote}${moduleName}${quote})>(${quote}${moduleName}${quote})`
      )
      .replace(/vi\.mock\(([^,]+),\s*\(\)\s*=>/g, 'vi.mock($1, async () =>');
  }

  const importedTypes = new Set();
  const typeMappings = [
    ['MockedFunction', 'MockedFunction'],
    ['Mocked', 'Mocked'],
    ['SpyInstance', 'MockInstance']
  ];
  for (const [jestType, vitestType] of typeMappings) {
    const pattern = new RegExp(`\\bjest\\.${jestType}\\b`, 'g');
    if (pattern.test(transformed)) {
      importedTypes.add(vitestType);
      transformed = transformed.replace(pattern, vitestType);
    }
  }

  transformed = transformed.replace(
    /\bjest\.Mock<ReturnType<([^>]+)>,\s*Parameters<\1>>/g,
    (_match, procedure) => {
      importedTypes.add('Mock');
      return `Mock<${procedure}>`;
    }
  );
  if (/\bjest\.Mock<any,\s*any>/.test(transformed)) {
    importedTypes.add('Mock');
    transformed = transformed.replace(/\bjest\.Mock<any,\s*any>/g, 'Mock');
  }
  if (/\bjest\.Mock\b/.test(transformed)) {
    importedTypes.add('Mock');
    transformed = transformed.replace(/\bjest\.Mock\b/g, 'Mock');
  }

  if (importedTypes.size > 0 && !/from ['"]vitest['"]/.test(transformed)) {
    const names = [...importedTypes].toSorted().join(',\n  ');
    transformed = `import type {\n  ${names},\n} from 'vitest';\n${transformed}`;
  }

  return {
    source: transformed,
    changed: transformed !== source
  };
};

/**
 * Adapts legacy Jest done-callback tests to Vitest promises without changing
 * their assertion bodies.
 * @param {string} source Test source.
 * @returns {string} Source using the promise adapter where needed.
 */
export const ensurePromiseCallbacks = (source) => {
  if (!/\bit\([^\n]+,\s*\(done\)\s*=>/.test(source)) {
    return source;
  }
  const adapted = source.replace(
    /\bit\(([^\n]+?),\s*\(done\)\s*=>/g,
    'itWithDone($1, (done) =>'
  );
  if (adapted.includes('const itWithDone =')) {
    return adapted;
  }
  // eslint-disable-next-line @stylistic/max-len -- exact generated callback compatibility helper
  const helper = `type DoneCallback = (() => void) & { fail: (error?: unknown) => void };\n\nconst itWithDone = (name: string, test: (done: DoneCallback) => void) =>\n  it(name, () => new Promise<void>((resolve, reject) =>\n    test(Object.assign(resolve, { fail: reject }))\n  ));\n\n`;
  return adapted.replace(/(?=describe\()/, helper);
};

/**
 * Converts deferred CommonJS imports used after Jest mocks into Vitest's
 * non-hoisted mock plus dynamic-import pattern.
 * @param {string} source Test source.
 * @returns {string} Converted source.
 */
export const transformDeferredRequires = (source) => {
  if (!/require\((['"])\.[^'"]+\1\)/.test(source)) {
    return source;
  }
  return source
    .replace(/\bvi\.mock\b/g, 'vi.doMock')
    .replace(/require\((['"])(\.[^'"]+)\1\)/g, "(await import('$2'))")
    .replace(/\bbeforeEach\(\(\) =>/g, 'beforeEach(async () =>')
    .replace(/\b(beforeAll|it|test)\(([^,\n]+),\s*\(\) =>/g, '$1($2, async () =>');
};

/**
 * Adds explicit Vitest fake-timer lifecycle hooks when a test advances timers
 * but does not enable them itself.
 * @param {string} source Test source.
 * @returns {string} Source with timer hooks when required.
 */
export const ensureFakeTimers = (source) => {
  if (!/\bvi\.(?:advanceTimers|runAllTimers)/.test(source) || source.includes('vi.useFakeTimers')) {
    return source;
  }
  return source.replace(
    /(?=describe\()/,
    'beforeEach(() => vi.useFakeTimers());\nafterEach(() => vi.useRealTimers());\n\n'
  );
};

/**
 * Updates one JSONC value while retaining comments and surrounding formatting.
 * @param {string} source JSONC source.
 * @param {(string | number)[]} path Property path.
 * @param {unknown} value Replacement value.
 * @returns {string} Updated JSONC source.
 */
export const updateJson = (source, path, value) => applyEdits(
  source,
  modify(source, path, value, JSON_FORMAT)
);

const angularSetupReplacement = [
  "import '@angular/compiler';",
  "import '@analogjs/vitest-angular/setup-snapshots';",
  'import {',
  '  setupTestBed,',
  "} from '@analogjs/vitest-angular/setup-testbed';",
  '',
  'setupTestBed();'
].join('\n');

const oraSetupReplacement = [
  '// Avoid loading the ESM-only terminal spinner through Angular DevKit CommonJS tasks.',
  'vi.mock(\'ora\', () => ({',
  '  default: vi.fn(() => ({ fail: vi.fn(), start: vi.fn(), stop: vi.fn(), succeed: vi.fn() }))',
  '}));'
].join('\n');

const builderSetupReplacement = [
  oraSetupReplacement,
  '// Mock telemetry wrappers to keep builder tests local and deterministic.',
  "vi.mock('@o3r/extractors', async () => ({",
  "  ...(await vi.importActual('@o3r/extractors')),",
  '  createBuilderWithMetricsIfInstalled: vi.fn().mockImplementation((fn) => fn)',
  '}));',
  "vi.mock('@o3r/schematics', async () => ({",
  "  ...(await vi.importActual('@o3r/schematics')),",
  '  createOtterSchematic: vi.fn().mockImplementation((fn) => fn)',
  '}));'
].join('\n');

// eslint-disable-next-line @stylistic/max-len -- exact generated compatibility setup content
const compatSetupSource = `import {\n  readFileSync,\n} from 'node:fs';\nimport Module, {\n  createRequire,\n} from 'node:module';\nimport typescript from 'typescript';\nimport {\n  vi,\n} from 'vitest';\n\n// Angular's schematic runner loads TypeScript factories through CommonJS.\nconst require = createRequire(import.meta.url);\nrequire.extensions['.ts'] ||= (module, filename) => {\n  const output = typescript.transpileModule(readFileSync(filename, 'utf8'), {\n    compilerOptions: {\n      esModuleInterop: true,\n      module: typescript.ModuleKind.CommonJS,\n      target: typescript.ScriptTarget.ES2022\n    },\n    fileName: filename\n  }).outputText.replace(\n    /require\\(["']ora["']\\)/g,\n    '(() => () => ({ fail() {}, start() { return this; }, stop() {}, succeed() {} }))()'\n  );\n  module._compile(output, filename);\n};\n\n// Angular DevKit's CJS task executor imports the ESM-only ora package. Tests do\n// not render spinners, so intercept that one CJS request.\nconst originalLoad = Reflect.get(Module, '_load');\nReflect.set(Module, '_load', function loadWithTestCompatibility(request, ...args) {\n  if (request === 'ora') {\n    return () => ({ fail() {}, start() { return this; }, stop() {}, succeed() {} });\n  }\n  return Reflect.apply(originalLoad, this, [request, ...args]);\n});\n\n// Preserve Jest-oriented user Fixtures and shared helpers while repository\n// tests execute under Vitest.\nObject.defineProperty(globalThis, 'jest', {\n  configurable: true,\n  value: vi\n});\n\n// jsdom does not retain the non-standard textWrap property used by existing tests.\nconst stylePrototype = globalThis.CSSStyleDeclaration?.prototype;\nif (stylePrototype) {\n  const textWrapValue = Symbol('textWrap');\n  Object.defineProperty(stylePrototype, 'textWrap', {\n    configurable: true,\n    get() { return this[textWrapValue] ?? ''; },\n    set(value) { this[textWrapValue] = value; }\n  });\n}\n`;

const transformSetupSource = (source) => {
  let transformed = source.replace(
    /import \{\s*setup(?:Zone|Zoneless)TestEnv,?\s*\} from 'jest-preset-angular\/setup-env\/(?:zone|zoneless)';\s*setup(?:Zone|Zoneless)TestEnv\(\);/m,
    angularSetupReplacement
  );
  transformed = transformed
    .replace(/import \{\s*getTestBed,\s*TestBed,?\s*\} from '@angular\/core\/testing';\s*/m, '')
    .replace(/import \{\s*BrowserDynamicTestingModule,\s*platformBrowserDynamicTesting,?\s*\} from '@angular\/platform-browser-dynamic\/testing';\s*/m, '')
    .replace(/getTestBed\(\)\.platform \|\| TestBed\.initTestEnvironment\([\s\S]*?\);\s*afterEach\(\(\) => TestBed\.resetTestingModule\(\)\);/m, 'setupTestBed();');
  if (transformed.includes("import '@angular/compiler';")
    && !transformed.includes('@analogjs/vitest-angular/setup-testbed')) {
    transformed = transformed.replace(
      "import '@angular/compiler';",
      "import '@angular/compiler';\nimport '@analogjs/vitest-angular/setup-snapshots';\nimport {\n  setupTestBed,\n} from '@analogjs/vitest-angular/setup-testbed';"
    );
  }
  transformed = transformed.replace(
    /import '@o3r\/test-helpers\/setup-jest-builders';/g,
    builderSetupReplacement
  );
  return transformTestSource(transformed).source;
};

const toPosix = (path) => path.split(sep).join('/');
const writeIfChanged = (path, source, writes, workspaceRoot) => {
  const current = existsSync(path) ? readFileSync(path, 'utf8') : undefined;
  if (current !== source) {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, source);
    writes.add(toPosix(relative(workspaceRoot, path)));
  }
};

const deleteIfPresent = (path, writes, workspaceRoot) => {
  if (existsSync(path)) {
    rmSync(path);
    writes.add(toPosix(relative(workspaceRoot, path)));
  }
};

const buildVitestConfig = ({ projectDirectory, workspaceRoot, setupFiles, unitSpecCount, angular }) => {
  const rootConfig = toPosix(relative(projectDirectory, join(workspaceRoot, 'vitest.config')));
  if (!angular && setupFiles.length === 0 && unitSpecCount > 0) {
    return `export { default } from '${rootConfig}';\n`;
  }
  const testLines = [];
  if (angular) {
    testLines.push("    environment: 'jsdom',");
  }
  if (unitSpecCount === 0) {
    testLines.push('    passWithNoTests: true,');
  }
  if (setupFiles.length > 0) {
    testLines.push(`    setupFiles: [...(baseConfig.test?.setupFiles ?? []), ${setupFiles.map((file) => `'./${file}'`).join(', ')}],`);
  }
  return `import baseConfig from '${rootConfig}';\n\nexport default {\n  ...baseConfig,\n  test: {\n    ...baseConfig.test,\n${testLines.join('\n')}\n  }\n};\n`;
};

const migrateProject = ({ projectDirectory, workspaceRoot, apply }) => {
  const relativeProject = toPosix(relative(workspaceRoot, projectDirectory));
  const specFiles = globbySync(['**/*.spec.ts', '**/*.test.ts'], {
    absolute: true,
    cwd: projectDirectory,
    gitignore: true
  }).filter((path) => !isProtectedTestPath(toPosix(relative(workspaceRoot, path))));
  const writes = new Set();
  const setupFiles = globbySync(['testing/setup-jest*.ts', 'testing/setup-vitest*.ts'], {
    absolute: true,
    cwd: projectDirectory
  });
  const setupSources = new Map(setupFiles.map((path) => [path, readFileSync(path, 'utf8')]));
  const angular = [...setupSources.values()].some((source) => source.includes('jest-preset-angular')
    || source.includes('@angular/core/testing'));
  const convertedSetups = setupFiles.map((setupPath) => {
    const targetPath = setupPath.replace('setup-jest', 'setup-vitest');
    if (apply) {
      writeIfChanged(targetPath, transformSetupSource(setupSources.get(setupPath)), writes, workspaceRoot);
      if (setupPath !== targetPath) {
        deleteIfPresent(setupPath, writes, workspaceRoot);
      }
    }
    return toPosix(relative(projectDirectory, targetPath));
  });

  if (apply) {
    for (const specPath of specFiles) {
      const current = readFileSync(specPath, 'utf8');
      const transformed = transformTestSource(current);
      if (transformed.changed) {
        writeIfChanged(specPath, transformed.source, writes, workspaceRoot);
      }
    }

    const projectFile = join(projectDirectory, 'project.json');
    let projectSource = readFileSync(projectFile, 'utf8');
    projectSource = updateJson(projectSource, ['targets', 'vitest'], { plugin: '@nx/vitest' });
    projectSource = updateJson(projectSource, ['targets', 'test'], {
      executor: 'nx:noop',
      dependsOn: ['vitest']
    });
    writeIfChanged(projectFile, projectSource, writes, workspaceRoot);

    const packageFile = join(projectDirectory, 'package.json');
    if (existsSync(packageFile)) {
      let packageSource = readFileSync(packageFile, 'utf8');
      for (const [name, version] of Object.entries(VITEST_DEPENDENCIES)) {
        packageSource = updateJson(packageSource, ['devDependencies', name], version);
      }
      writeIfChanged(packageFile, packageSource, writes, workspaceRoot);
    }

    const tsconfigSpec = join(projectDirectory, 'tsconfig.spec.json');
    if (existsSync(tsconfigSpec)) {
      let tsconfigSource = readFileSync(tsconfigSpec, 'utf8');
      tsconfigSource = tsconfigSource.replace(/tsconfig\.jest/g, 'tsconfig.test');
      writeIfChanged(tsconfigSpec, tsconfigSource, writes, workspaceRoot);
    }

    const tsconfigEslint = join(projectDirectory, 'tsconfig.eslint.json');
    if (existsSync(tsconfigEslint)) {
      const eslintSource = readFileSync(tsconfigEslint, 'utf8').replace(/jest\.config\.js/g, 'vitest.config.ts');
      writeIfChanged(tsconfigEslint, eslintSource, writes, workspaceRoot);
    }

    const compatSetupPath = join(projectDirectory, 'testing/setup-vitest-compat.mjs');
    writeIfChanged(compatSetupPath, compatSetupSource, writes, workspaceRoot);
    writeIfChanged(
      join(projectDirectory, 'vitest.config.ts'),
      buildVitestConfig({
        projectDirectory,
        workspaceRoot,
        setupFiles: ['testing/setup-vitest-compat.mjs', ...convertedSetups],
        unitSpecCount: specFiles.length,
        angular
      }),
      writes,
      workspaceRoot
    );

    deleteIfPresent(join(projectDirectory, 'jest.config.js'), writes, workspaceRoot);
    for (const unitConfig of globbySync('testing/jest.config.ut*.{js,cjs,mjs}', {
      absolute: true,
      cwd: projectDirectory
    })) {
      deleteIfPresent(unitConfig, writes, workspaceRoot);
    }
  }

  return {
    project: relativeProject,
    status: apply ? 'migrated' : 'ready',
    reason: undefined,
    writes: [...writes].toSorted()
  };
};

/**
 * Plans or applies the supported bulk Jest-to-Vitest migration.
 * @param {string} workspaceRoot Absolute workspace root.
 * @param {boolean} apply Whether to write changes.
 * @returns {{projects: ReturnType<typeof migrateProject>[], migrated: number, manual: number}}
 * Migration report.
 */
export const migrateWorkspace = (workspaceRoot, apply = false) => {
  const projectDirectories = globbySync('{apps,mcps,packages,tools}/**/jest.config.js', {
    absolute: true,
    cwd: workspaceRoot,
    gitignore: true
  })
    .map((config) => dirname(config))
    .filter((directory) => !existsSync(join(directory, 'vitest.config.ts')));
  const projects = projectDirectories.map((projectDirectory) => migrateProject({
    projectDirectory,
    workspaceRoot,
    apply
  }));
  if (apply) {
    const migratedDirectories = globbySync('{apps,mcps,packages,tools}/**/vitest.config.ts', {
      absolute: true,
      cwd: workspaceRoot,
      gitignore: true
    }).map((config) => dirname(config));

    for (const projectDirectory of migratedDirectories) {
      const oldCompatSetupPath = join(projectDirectory, 'testing/setup-vitest-compat.ts');
      deleteIfPresent(oldCompatSetupPath, new Set(), workspaceRoot);
      const compatSetupPath = join(projectDirectory, 'testing/setup-vitest-compat.mjs');
      writeIfChanged(compatSetupPath, compatSetupSource, new Set(), workspaceRoot);
      const packageFile = join(projectDirectory, 'package.json');
      if (existsSync(packageFile)) {
        let packageSource = readFileSync(packageFile, 'utf8');
        for (const [name, version] of Object.entries(VITEST_DEPENDENCIES)) {
          packageSource = updateJson(packageSource, ['devDependencies', name], version);
        }
        packageSource = updateJson(packageSource, ['devDependencies', 'jiti'], undefined);
        packageSource = updateJson(packageSource, ['devDependencies', 'tsx'], undefined);
        writeIfChanged(packageFile, packageSource, new Set(), workspaceRoot);
      }
      const configPath = join(projectDirectory, 'vitest.config.ts');
      const angularProject = globbySync('testing/setup-vitest*.ts', {
        absolute: true,
        cwd: projectDirectory
      }).some((setupPath) => readFileSync(setupPath, 'utf8').includes('@analogjs/vitest-angular/setup-testbed'));
      const configSource = readFileSync(configPath, 'utf8');
      let refreshedSource = configSource
        .replaceAll('setup-vitest-compat.ts', 'setup-vitest-compat.mjs')
        .replace(
          /^\s+setupFiles: \['\.\/testing\/setup-vitest-compat\.mjs'\],\n(?=[\s\S]*setupFiles:)/m,
          ''
        );
      if (/^export \{ default \} from ['"][^'"]+['"];\s*$/.test(configSource.trim())) {
        refreshedSource = buildVitestConfig({
          projectDirectory,
          workspaceRoot,
          setupFiles: ['testing/setup-vitest-compat.mjs'],
          unitSpecCount: 1,
          angular: false
        });
      } else if (configSource.includes('setupFiles: [...(baseConfig.test?.setupFiles ?? []), ')) {
        refreshedSource = configSource.replace(
          'setupFiles: [...(baseConfig.test?.setupFiles ?? []), ',
          "setupFiles: ['./testing/setup-vitest-compat.mjs', "
        );
      } else if (!configSource.includes('setup-vitest-compat.mjs')) {
        const [needle, replacement] = configSource.includes('...baseConfig.test,')
          ? [
            '...baseConfig.test,',
            "...baseConfig.test,\n    setupFiles: ['./testing/setup-vitest-compat.mjs'],"
          ]
          : [
            'test: {',
            "test: {\n    setupFiles: ['./testing/setup-vitest-compat.mjs'],"
          ];
        refreshedSource = configSource.replace(needle, replacement);
      }
      if (angularProject && !refreshedSource.includes("from '@analogjs/vite-plugin-angular'")) {
        refreshedSource = `import angular from '@analogjs/vite-plugin-angular';\n${refreshedSource}`
          .replace('  ...baseConfig,', '  ...baseConfig,\n  plugins: [...(baseConfig.plugins ?? []), angular()],');
      }
      writeIfChanged(configPath, refreshedSource, new Set(), workspaceRoot);
      for (const setupPath of globbySync('testing/setup-vitest*.ts', {
        absolute: true,
        cwd: projectDirectory
      })) {
        let setupSource = transformSetupSource(readFileSync(setupPath, 'utf8'));
        if (setupPath.endsWith('setup-vitest.builders.ts') && !setupSource.includes("vi.mock('ora'")) {
          setupSource = `${oraSetupReplacement}\n${setupSource}`;
        }
        writeIfChanged(setupPath, setupSource, new Set(), workspaceRoot);
      }
      for (const specPath of globbySync(['**/*.spec.ts', '**/*.test.ts'], {
        absolute: true,
        cwd: projectDirectory,
        gitignore: true
      }).filter((path) => !isProtectedTestPath(toPosix(relative(workspaceRoot, path))))) {
        if (specPath.endsWith('check-test-runner-config.spec.ts')) {
          continue;
        }
        const source = readFileSync(specPath, 'utf8');
        writeIfChanged(
          specPath,
          ensureFakeTimers(ensurePromiseCallbacks(transformDeferredRequires(source))),
          new Set(),
          workspaceRoot
        );
      }
    }
  }
  return {
    projects,
    migrated: projects.filter(({ status }) => status === (apply ? 'migrated' : 'ready')).length,
    manual: projects.filter(({ status }) => status === 'manual').length
  };
};

const isMainModule = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMainModule) {
  const workspaceRoot = resolve(import.meta.dirname, '..', '..', '..', '..');
  const apply = process.argv.includes('--apply');
  const report = migrateWorkspace(workspaceRoot, apply);
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
}
