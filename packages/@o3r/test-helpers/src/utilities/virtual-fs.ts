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
  jest.mock('node:fs', () => fileSystem);
  jest.mock('node:fs/promises', () => fileSystem.promises);

  return virtualFileSystem;
}

/**
 * Unmock calls to `node:fs`
 */
export function cleanVirtualFileSystem() {
  jest.unmock('node:fs');
  jest.unmock('node:fs/promises');
}
