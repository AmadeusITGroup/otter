import {
  readFileSync
} from 'node:fs';
import * as path from 'node:path';
import {
  satisfies
} from 'semver';
import {
  PackageJson
} from 'type-fest';

/**
 * Interface containing a npm package name, needed version and optionally found version
 * @deprecated You can use the one exposed in `@o3r/schematics`, will be removed in Otter v12.
 */
export interface PackageVersion {
  /** Npm package name */
  packageName: string;
  /** Npm package needed version */
  version: string;
  /** Npm package installed version found */
  foundVersion?: string;
}

/**
 * Check if the first level of peer deps of a given package are installed.
 * List all not installed packages or packages with version mismatch
 * @deprecated You can use the one exposed in `@o3r/schematics`, will be removed in Otter v12.
 * @param packageName
 */
export function getPackagesToInstallOrUpdate(packageName: string) {
  let installedPackage: PackageJson;
  try {
    const packageJsonNamePath = require.resolve(`${packageName}${path.posix.sep}package.json`);
    installedPackage = JSON.parse(readFileSync(packageJsonNamePath, { encoding: 'utf8' }));
  } catch {
    throw new Error(`The provided package is not installed: ${packageName}`);
  }

  const packagesToInstall: PackageVersion[] = [];
  const packagesWrongVersion: PackageVersion[] = [];

  const optionalPackages = Object.entries(installedPackage.peerDependenciesMeta || {})
    .filter(([, dep]) => dep?.optional)
    .map(([depName]) => depName);
  const peerDependenciesMap = Object.entries(installedPackage.peerDependencies || {})
    .reduce<Partial<Record<string, string>>>((acc, [name, val]) => {
      if (!optionalPackages.includes(name)) {
        acc[name] = val;
      }
      return acc;
    }, {});
  Object.entries(peerDependenciesMap).forEach(([pName, pVersion]) => {
    let installedPackageVersion: string | undefined;
    try {
      const packageJsonNamePath = require.resolve(`${pName}${path.posix.sep}package.json`);
      installedPackageVersion = JSON.parse(readFileSync(packageJsonNamePath, { encoding: 'utf8' })).version;
    } catch {
      packagesToInstall.push({ packageName: pName, version: pVersion! });
    }
    if (installedPackageVersion && !satisfies(installedPackageVersion, pVersion!)) {
      packagesWrongVersion.push({ packageName: pName, foundVersion: installedPackageVersion, version: pVersion! });
    }
  });
  return { packagesToInstall, packagesWrongVersion };
}
