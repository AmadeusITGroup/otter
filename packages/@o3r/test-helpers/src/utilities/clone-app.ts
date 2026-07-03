import {
  execFileSync,
} from 'node:child_process';
import {
  cpSync,
} from 'node:fs';

/**
 * Regular expressions matching folders that must never be copied when reinstalling dependencies in the copied app.
 * `.git` is skipped because each test re-initializes its own repository to check diffs.
 */
const EXCLUDED_FROM_INSTALL_COPY = [
  /(?:^|[/\\])node_modules(?:[/\\]|$)/,
  /(?:^|[/\\])\.git(?:[/\\]|$)/
];

/**
 * Only `.git` is excluded when cloning a fully installed app: `node_modules` is kept on purpose so that no reinstall is required.
 */
const EXCLUDED_FROM_FULL_CLONE = [
  /(?:^|[/\\])\.git(?:[/\\]|$)/
];

/**
 * Whether the test apps should be cloned using a copy-on-write (reflink) copy of the fully installed base app,
 * instead of copying the sources and reinstalling the dependencies.
 *
 * This is only beneficial (and correct performance-wise) on a copy-on-write capable filesystem:
 * - Windows: a ReFS Dev Drive (`CopyFileW` performs automatic block cloning on the same volume)
 * - Linux: a btrfs/xfs volume supporting `cp --reflink`
 *
 * It is opt-in through the `O3R_IT_TESTS_COW_CLONE` environment variable so that every environment where the
 * filesystem does not support copy-on-write keeps the previous behaviour (copy sources + reinstall) unchanged.
 */
export function isCopyOnWriteCloneEnabled() {
  return process.env.O3R_IT_TESTS_COW_CLONE === 'true' || process.env.O3R_IT_TESTS_COW_CLONE === '1';
}

/**
 * Clone the fully installed base app (including its `node_modules`) into the destination using a copy-on-write
 * (reflink) copy when possible, so that no dependency reinstall is required.
 *
 * On Linux, `cp --reflink=auto` is used so the copy transparently falls back to a regular copy when the
 * filesystem does not support reflinks. On Windows, Node's `cpSync` (backed by `CopyFileW`) already performs
 * block cloning automatically on a ReFS volume, so it is used directly.
 * @param source Path to the fully installed base app
 * @param destination Path where the app must be cloned
 */
export function copyOnWriteClone(source: string, destination: string) {
  if (process.platform === 'win32') {
    // On a ReFS Dev Drive, CopyFileW (used by cpSync) performs automatic block cloning on the same volume.
    cpSync(source, destination, {
      recursive: true,
      filter: (src) => !EXCLUDED_FROM_FULL_CLONE.some((exclude) => exclude.test(src))
    });
    return;
  }
  // On Linux/macOS, request a reflink copy and let the filesystem fall back to a regular copy when unsupported.
  execFileSync('cp', ['--recursive', '--reflink=auto', source, destination], { stdio: 'inherit' });
}

/**
 * Copy the sources of the base app (excluding `node_modules` and `.git`) into the destination.
 * The caller is expected to reinstall the dependencies afterwards.
 * @param source Path to the base app
 * @param destination Path where the sources must be copied
 */
export function copyAppSources(source: string, destination: string) {
  cpSync(source, destination, {
    recursive: true,
    dereference: true,
    filter: (src) => !EXCLUDED_FROM_INSTALL_COPY.some((exclude) => exclude.test(src))
  });
}
