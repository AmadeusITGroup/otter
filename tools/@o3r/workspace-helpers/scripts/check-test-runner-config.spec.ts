import {
  describe,
  expect,
  it,
} from 'vitest';
import {
  hasVitestDependency,
  validateProjectTestRunner,
} from './check-test-runner-config.mjs';
import {
  ensureFakeTimers,
  ensurePromiseCallbacks,
  isProtectedTestPath,
  transformDeferredRequires,
  transformTestSource,
} from './migrate-jest-to-vitest.mjs';

const validProject = {
  targets: {
    test: {
      executor: 'nx:noop',
      dependsOn: ['vitest']
    },
    vitest: {
      plugin: '@nx/vitest'
    }
  }
};

type DoneCallback = (() => void) & { fail: (error?: unknown) => void };

const itWithDone = (name: string, test: (done: DoneCallback) => void) =>
  it(name, () => new Promise<void>((resolve, reject) =>
    test(Object.assign(resolve, { fail: reject }))
  ));

describe('test runner configuration check', () => {
  it('accepts an unmigrated Jest project during incremental migration', () => {
    expect(validateProjectTestRunner({
      projectFile: 'packages/example/project.json',
      project: { targets: { test: {} } },
      vitestConfig: undefined
    })).toEqual([]);
  });

  it('accepts coherent Vitest configuration and target wiring', () => {
    expect(validateProjectTestRunner({
      projectFile: 'packages/example/project.json',
      project: validProject,
      vitestConfig: 'packages/example/vitest.config.ts'
    })).toEqual([]);
  });

  it('requires a Vitest config when targets delegate to Vitest', () => {
    expect(validateProjectTestRunner({
      projectFile: 'packages/example/project.json',
      project: validProject,
      vitestConfig: undefined
    })).toContain('packages/example/project.json: declares Vitest wiring but has no vitest.config.* file.');
  });

  it('requires a Vitest target when a config exists', () => {
    expect(validateProjectTestRunner({
      projectFile: 'packages/example/project.json',
      project: { targets: { test: {} } },
      vitestConfig: 'packages/example/vitest.config.ts'
    })).toContain('packages/example/project.json: has Vitest configuration but no "vitest" target.');
  });

  it('requires the test target to delegate to Vitest', () => {
    expect(validateProjectTestRunner({
      projectFile: 'packages/example/project.json',
      project: { targets: { vitest: {} }, test: {} },
      vitestConfig: 'packages/example/vitest.config.ts'
    })).toContain('packages/example/project.json: Vitest projects must use @nx/vitest:test directly or set "test" to nx:noop with dependsOn: ["vitest"].');
  });

  it('accepts the existing direct Vitest executor form', () => {
    expect(validateProjectTestRunner({
      projectFile: 'packages/example/project.json',
      project: { targets: { test: { executor: '@nx/vitest:test' } } },
      vitestConfig: 'packages/example/vitest.config.ts'
    })).toEqual([]);
  });

  it('recognizes object-form Nx target dependencies', () => {
    expect(hasVitestDependency([{ target: 'vitest', projects: 'self' }])).toBe(true);
  });

  it('rejects unrelated target dependencies', () => {
    expect(hasVitestDependency(['build', { target: 'lint' }])).toBe(false);
  });
});

describe('Jest-to-Vitest source migration', () => {
  it('protects integration tests, templates, and user fixture implementations', () => {
    expect(isProtectedTestPath('packages/example/src/example.it.spec.ts')).toBe(true);
    expect(isProtectedTestPath('packages/example/schematics/templates/example.spec.ts')).toBe(true);
    expect(isProtectedTestPath('packages/example/src/fixtures/example.spec.ts')).toBe(true);
    expect(isProtectedTestPath('packages/example/src/example.spec.ts')).toBe(false);
  });

  it('converts supported Jest runtime APIs to Vitest', () => {
    const result = transformTestSource('const mock = jest.fn(); jest.spyOn(console, \'log\');');
    expect(result.source).toBe('const mock = vi.fn(); vi.spyOn(console, \'log\');');
    expect(result.changed).toBe(true);
  });

  it('converts Jest namespace types and adds Vitest type imports', () => {
    const result = transformTestSource('let service: jest.Mocked<Service>;');
    expect(result.source).toContain("import type {\n  Mocked,\n} from 'vitest';");
    expect(result.source).toContain('let service: Mocked<Service>;');
  });
});

describe('Vitest timer migration', () => {
  it('adds fake-timer lifecycle hooks only when timer advancement needs them', () => {
    const source = "describe('timers', () => vi.runAllTimers());";
    expect(ensureFakeTimers(source)).toContain('beforeEach(() => vi.useFakeTimers());');
    expect(ensureFakeTimers(source)).toContain('afterEach(() => vi.useRealTimers());');
  });

  it('keeps explicit fake-timer setup unchanged', () => {
    const source = "beforeEach(async () => vi.useFakeTimers());\ndescribe('timers', () => vi.runAllTimers());";
    expect(ensureFakeTimers(source)).toBe(source);
  });
});

describe('Vitest actual-module migration', () => {
  it('uses an async importActual factory', () => {
    const source = "jest.mock('node:path', () => ({ ...jest.requireActual('node:path') }));";
    const result = transformTestSource(source).source;
    expect(result).toContain("vi.mock('node:path', async () =>");
    expect(result).toContain("await vi.importActual<typeof import('node:path')>('node:path')");
  });
});

describe('deferred module migration', () => {
  it('uses doMock and dynamic import inside async test callbacks', () => {
    const source = "it('loads', () => { vi.mock('./dependency', () => ({})); return require('./subject'); });";
    const result = transformDeferredRequires(source);
    expect(result).toContain("it('loads', async () =>");
    expect(result).toContain("vi.doMock('./dependency'");
    expect(result).toContain("(await import('./subject'))");
  });
});

describe('done callback migration', () => {
  it('adapts callback tests to a promise wrapper', () => {
    const source = "describe('x', () => { it('emits', (done) => { done(); }); });";
    const result = ensurePromiseCallbacks(source);
    expect(result).toContain("itWithDone('emits', (done) =>");
    expect(result).toContain('new Promise<void>');
  });
});
