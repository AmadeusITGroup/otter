import { existsSync, readFileSync } from 'node:fs';
import * as path from 'node:path';
import { satisfies } from 'semver';
import type { PackageJson } from 'type-fest';
import { Locker, LockerOptions } from './locker';

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
   * Use locker to block parallel creation
   */
  useLocker?: boolean;

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
  if (options.useLocker && locker.isLocked()) {
    return locker.waitUntilUnlocked();
  }
  if (options.useLocker) {
    const hasFolderBeenLocked = locker.lock();
    if (!hasFolderBeenLocked) {
      // If lock couldn't be created due to race condition, it means another process is creating the app
      return locker.waitUntilUnlocked();
    }
  }
  const appFolderPath = path.join(options.cwd, options.appDirectory);
  if (existsSync(appFolderPath)) {
    if (!options.replaceExisting) {
      if (options.useLocker) {
        locker.unlock();
      }
      return;
    }
    const packageJson: PackageJson = JSON.parse(readFileSync(path.join(appFolderPath, 'package.json'), {encoding: 'utf8'}));
    const areDependenciesMatching = options.dependenciesToCheck?.every(({name, expected, type}) => {
      const actual = packageJson[type || 'dependencies']?.[name];
      return !expected || (actual && satisfies(expected, actual));
    });
    if (areDependenciesMatching) {
      // No need to regenerate
      if (options.useLocker) {
        locker.unlock();
      }
      return;
    }
  }
  try {
    await createFunction();
  } catch (err) {
    if (options.useLocker) {
      locker.unlock();
    }
    throw err;
  }
  if (options.useLocker) {
    locker.unlock();
  }
}
