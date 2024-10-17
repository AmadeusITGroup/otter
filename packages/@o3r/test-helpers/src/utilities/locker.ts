import { existsSync, readFileSync, rmSync, statSync, watch, writeFileSync } from 'node:fs';
import * as path from 'node:path';

export interface LockerOptions {
  /**
   * Number of milliseconds after which the lock file is no longer considered
   */
  maxLockAge: number;

  /**
   * Maximum number of milliseconds to wait for a folder to be unlocked
   */
  lockTimeout: number;

  /**
   * Path of the file used to lock a folder
   */
  lockFilePath: string;
}

/**
 * Helper class used to lock a folder to handle parallel creation
 */
export class Locker {
  private readonly options: LockerOptions;

  constructor(options: Partial<LockerOptions>) {
    this.options = {
      maxLockAge: 10 * 60 * 1000,
      lockTimeout: 2 * 60 * 1000,
      lockFilePath: path.join(process.cwd(), 'lock'),
      ...options
    };
  }

  /**
   * Mark the folder as locked
   */
  public lock(): boolean {
    const pid = String(process.pid);
    try {
      writeFileSync(this.options.lockFilePath, pid, {flag: this.isLockExpired() ? 'w' : 'wx'});
      // Need to check if the file was created by this process
      return readFileSync(this.options.lockFilePath, {encoding: 'utf8'}) === pid;
    } catch {
      return false;
    }
  }

  /**
   * Unmark the folder as locked
   */
  public unlock(): void {
    rmSync(this.options.lockFilePath);
  }

  /**
   * Check if folder is marked as locked
   */
  public isLocked(): boolean {
    return existsSync(this.options.lockFilePath) && !this.isLockExpired();
  }

  /**
   * Check if the lock file is still valid
   */
  public isLockExpired(): boolean {
    if (process.env.CI) {
      return false;
    }
    try {
      return (Date.now() - statSync(this.options.lockFilePath).birthtime.getTime()) > this.options.maxLockAge;
    } catch {
      return false;
    }
  }

  /**
   * Wait until the folder is no longer marked as locked
   */
  public waitUntilUnlocked(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      let timer: ReturnType<typeof setTimeout> | undefined;
      let watcher: ReturnType<typeof watch> | undefined;

      timer = setTimeout(() => {
        if (watcher) {
          watcher.close();
        }
        reject(new Error(`Exceeded timeout while waiting for the unlock on ${this.options.lockFilePath}`));
      }, this.options.lockTimeout);
      const check = () => {
        if (!existsSync(this.options.lockFilePath)) {
          if (watcher) {
            watcher.close();
          }
          clearTimeout(timer);
          watcher = undefined;
          timer = undefined;
          resolve();
        }
      };
      try {
        watcher = watch(this.options.lockFilePath, {persistent: false}, check);
        watcher.on('error', check);
      } catch {
        check();
      }
    });
  }
}
