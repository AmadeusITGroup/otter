import { posix } from 'node:path';

/**
 * Check if an npm package is installed
 * @param packageName The package to check
 * @deprecated You can use the one exposed in `@o3r/schematics`, will be removed in Otter v12.
 */
export function isPackageInstalled(packageName: string) {
  try {
    return !!require.resolve(posix.join(packageName, 'package.json'));
  } catch {
    return false;
  }
}
