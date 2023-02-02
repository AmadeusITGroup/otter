import * as fs from 'node:fs';
import type { PackageJson } from 'type-fest';

/**
 * Return the version of the given package json path
 *
 * @param packageJsonPath
 */
export function getPackageVersion(packageJsonPath: string) {
  const packageJsonContent: PackageJson = JSON.parse(fs.readFileSync(packageJsonPath, { encoding: 'utf-8' }));
  return packageJsonContent.version;
}
