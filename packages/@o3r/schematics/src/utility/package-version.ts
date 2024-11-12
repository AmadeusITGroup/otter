import { Tree } from '@angular-devkit/schematics';
import * as fs from 'node:fs';
import { existsSync } from 'node:fs';
import { dirname, join, posix } from 'node:path';
import type { PackageJson } from 'type-fest';

/**
 * Return the version of the given package json path
 * @param packageJsonPath
 */
export function getPackageVersion(packageJsonPath: string) {
  const packageJsonContent: PackageJson = JSON.parse(fs.readFileSync(packageJsonPath, { encoding: 'utf8' }));
  return packageJsonContent.version;
}

/**
 * Find the closest package.json file in parent folders
 * Note: It is using file system if no tree provided
 * @param currentPath current path to inspect
 * @param tree current path to inspect
 * @returns
 */
export const findClosestPackageJson = (currentPath: string, tree?: Tree): string | undefined => {
  const dir = (tree ? posix.dirname : dirname)(currentPath);
  if (dir === currentPath || currentPath === '/') {
    return undefined;
  }

  const packageJsonPath = (tree ? posix.join : join)(dir, 'package.json');
  return (tree ? tree.exists : existsSync)(packageJsonPath) ? packageJsonPath : findClosestPackageJson(dir, tree);
};
