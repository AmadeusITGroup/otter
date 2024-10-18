import {
  readFileSync
} from 'node:fs';
import * as path from 'node:path';
import type {
  LoggerApi
} from '@angular-devkit/core/src/logger';
import type {
  SchematicContext,
  Tree
} from '@angular-devkit/schematics';
import {
  satisfies
} from 'semver';
import type {
  PackageJson
} from 'type-fest';
import {
  getPackageManager,
  O3rCliError
} from '../../utility/index';

/** Interface containing a npm package name, needed version and optionally found version */
interface PackageVersion {
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
 * @param packageName
 */
function getPackagesToInstallOrUpdate(packageName: string) {
  let installedPackage: PackageJson;
  try {
    const packageJsonNamePath = require.resolve(`${packageName}${path.posix.sep}package.json`);
    installedPackage = JSON.parse(readFileSync(packageJsonNamePath, { encoding: 'utf8' }));
  } catch {
    throw new O3rCliError(`The provided package is not installed: ${packageName}`);
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

/**
 * Log an instruction with the packages to install or update to match a package peer dependencies
 * @param packageName
 * @param angularJsonString
 * @param logger
 */
function checkPackagesToInstallOrUpdate(packageName: string, logger: LoggerApi, angularJsonString?: string | null) {
  const packageManager = getPackageManager({ workspaceConfig: angularJsonString });
  const { packagesToInstall, packagesWrongVersion } = getPackagesToInstallOrUpdate(packageName);

  if (packagesWrongVersion.length > 0) {
    logger.warn('');
    logger.warn(`The following packages have a mismatch version installed to satisfy "${packageName}" needed versions:`);
    packagesWrongVersion.forEach((dep) => {
      logger.warn(`${dep.packageName} found version is ${dep.foundVersion!}. "${packageName}" needs ${dep.version}`);
    });
    logger.warn('');
    logger.warn('You might consider reinstalling the packages with the good versions:');
    packagesWrongVersion.forEach((dep) => logger.warn(`${packageManager} run ng update ${dep.packageName}@${dep.version}`));
  }

  if (packagesToInstall.length > 0) {
    logger.error('');
    logger.error(`The following packages need to be installed to have "${packageName}" working. Run the commands one by one:`);
    packagesToInstall.forEach((dep) => logger.error(`${packageManager} run ng add ${dep.packageName}@${dep.version}`));
    throw new O3rCliError('Missing peer dependencies');
  }

  if (packagesToInstall.length === 0 && packagesWrongVersion.length === 0) {
    logger.info(`The package ${packageName} has all peer deps installed.\n`);
  }
}

/**
 * List peer deps packages of the given package, display a warning if version mismatch, error if peer dep is missing
 * @param packageName The package to check peer deps for
 */
export function checkPackagesRule(packageName: string) {
  return (tree: Tree, context: SchematicContext) => {
    const angularJson = tree.read('/angular.json');
    checkPackagesToInstallOrUpdate(packageName, context.logger, angularJson?.toString());
    return tree;
  };
}
