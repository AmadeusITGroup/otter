import {
  existsSync,
  readFileSync
} from 'node:fs';
import * as path from 'node:path';
import {
  satisfies
} from 'semver';
import type {
  PackageJson
} from 'type-fest';
import {
  Locker,
  LockerOptions
} from './locker';

export interface CreateWithLockOptions extends Partial<LockerOptions> {
  /**
   * Directory used to generate app
   */
  appDirectory: string;

  /**
   * Working directory
   */
  cwd: string;

  /**
   * Replace existing app if installed dependencies don't match
   */
  replaceExisting?: boolean;

  /**
   * Dependencies to check to replace existing app
   */
  dependenciesToCheck?: {
    name: string;
    expected?: string;
    type?: 'dependencies' | 'devDependencies' | 'peerDependencies';
  }[];
}

/**
 * Wrapper function to create a new test environment using lock mechanism
 * @param createFunction
 * @param options
 */
export async function createWithLock(createFunction: () => Promise<void>, options: CreateWithLockOptions) {
  const locker = new Locker(options);
  if (locker.isLocked()) {
    return locker.waitUntilUnlocked();
  }
  const hasFolderBeenLocked = locker.lock();
  if (!hasFolderBeenLocked) {
    // If lock couldn't be created due to race condition, it means another process is creating the app
    return locker.waitUntilUnlocked();
  }
  const appFolderPath = path.join(options.cwd, options.appDirectory);
  if (existsSync(appFolderPath)) {
    if (!options.replaceExisting) {
      locker.unlock();
      return;
    }
    let areDependenciesMatching = true;
    if (options.dependenciesToCheck) {
      const packageJson: PackageJson = JSON.parse(readFileSync(path.join(appFolderPath, 'package.json'), { encoding: 'utf8' }));
      areDependenciesMatching = options.dependenciesToCheck?.every(({ name, expected, type }) => {
        const actual = packageJson[type || 'dependencies']?.[name];
        return !expected || (actual && satisfies(expected, actual));
      });
    }
    if (areDependenciesMatching) {
      // No need to regenerate
      locker.unlock();
      return;
    }
  }
  try {
    await createFunction();
  } catch (err) {
    locker.unlock();
    throw err;
  }
  locker.unlock();
}
