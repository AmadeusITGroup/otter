import * as actualFileSystem from 'node:fs';
import {
  Volume,
} from 'memfs';
import {
  Union,
} from 'unionfs';

const FS_STATIC_PROPERTIES = [
  'constants', 'Stats', 'Dirent'
] as const satisfies (keyof typeof actualFileSystem)[];

/**
 * Minimal shape of the test-runner module mocker used by this helper. Both
 * Jest (`jest`) and Vitest (`vi`) expose compatible `mock`/`unmock` methods.
 */
interface TestRunnerMocker {
  mock: (moduleName: string, factory: () => unknown) => unknown;
  unmock: (moduleName: string) => unknown;
}

/**
 * Resolve the active test runner's module mocker.
 *
 * This helper ships in `@o3r/test-helpers` and is consumed under BOTH runners:
 * downstream projects still run it under Jest (where `jest` is the injected
 * global), while this repository runs it under Vitest (where `vi` is a global
 * because the Vitest config sets `globals: true`). We pick whichever global is
 * present rather than importing `vitest`, so the module never requires Vitest
 * to be installed in a Jest-only consumer.
 * @returns The active runner's mocker.
 */
const getTestRunnerMocker = (): TestRunnerMocker => {
  const runner = globalThis as typeof globalThis & {
    vi?: TestRunnerMocker;
    jest?: TestRunnerMocker;
  };
  const mocker = runner.vi ?? runner.jest ?? (typeof jest === 'undefined' ? undefined : jest);
  if (!mocker) {
    throw new Error(
      'useVirtualFileSystem requires a test runner mocker: neither "vi" (Vitest) nor "jest" (Jest) is available as a global. '
      + 'Ensure the test runner exposes its API as a global (Vitest: test.globals=true).'
    );
  }
  return mocker;
};

/**
 * Mock every call to `node:fs` to write files on a virtual memory instead of disk
 * @param shouldReadFromDisk Use false to not read files from disk
 */
export function useVirtualFileSystem(shouldReadFromDisk = true) {
  const virtualFileSystem = Volume.fromJSON({}) as any as Omit<typeof Volume, keyof typeof actualFileSystem> & typeof actualFileSystem;
  const fileSystem = new Union();
  if (shouldReadFromDisk) {
    // Use actual file system as read-only to fallback when file not present on virtual
    fileSystem.use(actualFileSystem);
  }
  // Use virtual file system as read-write
  fileSystem.use(virtualFileSystem);
  // Keep static properties from actual fs module
  for (const prop of FS_STATIC_PROPERTIES) {
    fileSystem[prop] = actualFileSystem[prop];
  }
  const mockedFileSystem = Object.assign(fileSystem, { default: fileSystem });
  const mockedPromises = Object.assign(fileSystem.promises, { default: fileSystem.promises });
  const mocker = getTestRunnerMocker();
  mocker.mock('node:fs', () => mockedFileSystem);
  mocker.mock('node:fs/promises', () => mockedPromises);

  return virtualFileSystem;
}

/**
 * Unmock calls to `node:fs`
 */
export function cleanVirtualFileSystem() {
  const mocker = getTestRunnerMocker();
  mocker.unmock('node:fs');
  mocker.unmock('node:fs/promises');
}
