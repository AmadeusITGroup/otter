import * as fs from 'node:fs';
import {
  logging,
} from '@angular-devkit/core';
import {
  NodeDependency,
  NodeDependencyType,
} from '@schematics/angular/utility/dependencies';
import {
  gt,
  minVersion,
  satisfies,
  subset,
  valid,
  validRange,
} from 'semver';
import type {
  PackageJson,
} from 'type-fest';
import {
  DependencyInManifest,
  DependencyToAdd,
} from '../interfaces/dependencies';
import {
  O3rCliError,
} from './error';

/**
 * Method to extract the provided package version range from a package.json file
 * Look for the range based on this order of priority:
 * - generatorDependencies
 * - peerDependencies
 * - dependencies
 * - devDependencies
 * @param packageNames list of package we want to retrieve the version
 * @param packageJsonPath Path to the package.json to refer to
 * @param logger logger
 * @returns The version range value retrieved from the provided package.json file
 */
export function getExternalDependenciesVersionRange<T extends string>(packageNames: T[], packageJsonPath: string, logger: logging.LoggerApi): Record<T, string> {
  const packageJsonContent = JSON.parse(fs.readFileSync(packageJsonPath, { encoding: 'utf8' })) as PackageJson & {
    generatorDependencies: Record<string, string>;
  };
  return packageNames.reduce((acc: Partial<Record<T, string>>, packageName) => {
    acc[packageName] = packageJsonContent.generatorDependencies?.[packageName]
      || packageJsonContent.peerDependencies?.[packageName]
      || packageJsonContent.dependencies?.[packageName]
      || packageJsonContent.devDependencies?.[packageName];
    if (!acc[packageName]) {
      logger.warn(`Unable to retrieve version for ${packageName} in ${packageJsonPath}. Version set to "latest".`);
      acc[packageName] = 'latest';
    }
    return acc;
  }, {}) as Record<T, string>;
}

/**
 * Replace the caret ranges by tilde ranges
 * @param range Range to replace
 */
export const enforceTildeRange = (range?: string) =>
  range === 'latest' ? range : range?.replace(/\^/g, '~');

/**
 * Return true if B is a subset of A or if minVersion of A is greater than minVersion of B
 * @param rangeA
 * @param rangeB
 */
export function isRangeGreater(rangeA: string, rangeB: string) {
  if (rangeA === 'latest' && rangeB !== 'latest') {
    return true;
  }
  if (rangeB === 'latest') {
    return false;
  }
  const minVersionA = minVersion(rangeA)!;
  const minVersionB = minVersion(rangeB)!;
  const isBPreleaseOfVersionA = minVersionB.prerelease?.length > 0
    && subset(`${minVersionB.major}.${minVersionB.minor}.${minVersionB.patch}`, rangeA);
  return subset(rangeB, rangeA) || isBPreleaseOfVersionA || (gt(minVersionA, minVersionB) && !subset(rangeA, rangeB));
}

/**
 * Compute the version range for a package based on the less restrictive version declared in the package.json.
 * If the versions declared in the package.json do not intersect, take the highest version.
 * @param packageName
 * @param packageJsonContent
 * @param isTildeEnforced
 */
export function getDependencyMaximumVersionRange(packageName: string, packageJsonContent: PackageJson, isTildeEnforced?: boolean): string {
  const rangeSortedByHighestMinimum = [
    packageJsonContent.peerDependencies?.[packageName],
    packageJsonContent.dependencies?.[packageName],
    packageJsonContent.devDependencies?.[packageName]
  ]
    .map((packageVersion) => isTildeEnforced && packageVersion ? enforceTildeRange(packageVersion) : packageVersion)
    .filter((packageVersion): packageVersion is string => {
      return valid(packageVersion) !== null || validRange(packageVersion) !== null;
    })
    .toSorted((rangeA, rangeB) =>
      isRangeGreater(rangeB, rangeA) ? 1 : (isRangeGreater(rangeA, rangeB) ? -1 : 0)
    );
  return rangeSortedByHighestMinimum[0];
}

/**
 * Find the range for this package based on the generatorDependency object of the package.json
 * If there are no specified generator dependency, look for the range with the highest minimum or the widest range
 * @param packageName
 * @param packageJsonPath
 * @param isTildeEnforced
 */
export function getVersionToInstallFromPackageJson(packageName: string, packageJsonPath: string, isTildeEnforced?: boolean): string | undefined {
  const packageJsonContent = (
    JSON.parse(fs.readFileSync(packageJsonPath, { encoding: 'utf8' }))
  ) as PackageJson & { generatorDependencies?: Record<string, string> };
  return packageJsonContent.generatorDependencies?.[packageName]
    ?? getDependencyMaximumVersionRange(packageName, packageJsonContent, isTildeEnforced);
}

/**
 * Check if a dependency has already been installed for the requested range
 * @param depName
 * @param packageJson
 * @param root0
 * @param root0.range
 * @param root0.types
 */
export function isDependencyAlreadyInstalled(depName: string, packageJson: PackageJson, {
  range,
  types
}: Required<DependencyInManifest>) {
  const packageJsonDepVersions = types?.map((type) => (packageJson[type] || {})[depName]);
  return packageJsonDepVersions.some((version) => !!version && (satisfies(version, range, { includePrerelease: true }) || subset(version, range, { includePrerelease: true })));
}

/**
 * Method used to build the list of node dependencies to be installed
 * @param dependenciesVersions map of dependency and its associated required version
 * @param type node type of the dependency
 * @returns the list of node dependencies to be installed
 */
export function getNodeDependencyList<T extends string>(dependenciesVersions: Record<T, string>, type: NodeDependencyType): NodeDependency[] {
  return Object.entries<string>(dependenciesVersions).map(([name, version]) => ({
    name,
    version,
    type,
    overwrite: true
  }));
}

/**
 * Retrieves information about external dependencies (peer and dev) for a given project.
 * @template T - Type of the dependency names.
 * @template U - Type of the dev dependency names.
 * @param params - The parameters object.
 * @param params.dependenciesToInstall - Array of external peer dependency names.
 * @param params.devDependenciesToInstall - Array of external dev dependency names.
 * @param params.o3rPackageJsonPath  - The path to the o3r `package.json` file.
 * @param params.projectPackageJson - The path to the package json of the project where the dependencies will be installed.
 * @param params.projectType - The angular type of the project, either 'application' or 'library'.
 * @param params.rootPackageJsonPath - Path to the root of the repository where the dependency will be installed
 * @param logger - The logger instance for logging information.
 * @param isInstallRequired - Whether the package should be installed or not. By default, return true.
 */
export function getExternalDependenciesInfo<T extends string, U extends string>(
  {
    dependenciesToInstall,
    devDependenciesToInstall,
    o3rPackageJsonPath,
    projectPackageJson,
    projectType,
    rootPackageJsonPath
  }: {
    dependenciesToInstall: T[];
    devDependenciesToInstall: U[];
    o3rPackageJsonPath: string;
    projectPackageJson: PackageJson;
    projectType?: 'application' | 'library';
    rootPackageJsonPath?: string;
  },
  logger?: logging.LoggerApi,
  isInstallRequired = (_: string): undefined | boolean => undefined
): Record<T | U, DependencyToAdd> {
  if (!projectPackageJson) {
    throw new O3rCliError(`Cannot install a dependency as there is no package.json in the project. ${JSON.stringify(dependenciesToInstall)}
    - Cannot install a dependency as there is no package.json in the project. ${JSON.stringify(devDependenciesToInstall)}`);
  }
  const rootPath = rootPackageJsonPath || 'package.json';
  const peerDependenciesInfo = dependenciesToInstall.reduce((acc, name) => {
    const rootVersion = [
      name,
      ...name.startsWith('@angular/') && !['@angular/cdk', '@angular/material'].includes(name) ? ['@angular/core'] : [],
      ...name.startsWith('@angular-devkit/') && name !== '@angular-devkit/architect' ? ['@angular-devkit/core'] : [],
      ...name.startsWith('@ngrx/') ? ['@ngrx/store'] : []
    ]
      .map((packageName) => getVersionToInstallFromPackageJson(packageName, rootPath, false))
      .find((version) => typeof version === 'string');
    let range = rootVersion || getVersionToInstallFromPackageJson(name, o3rPackageJsonPath, true);
    if (typeof range !== 'string') {
      logger?.warn(`Unable to retrieve version for ${name} in ${o3rPackageJsonPath}. Version set to "latest".`);
      range = 'latest';
    }
    const inManifest = {
      range,
      types: projectType === 'application' ? [NodeDependencyType.Default] : [NodeDependencyType.Peer, NodeDependencyType.Dev]
    };

    if (isDependencyAlreadyInstalled(name, projectPackageJson, inManifest)) {
      return acc;
    }
    acc[name] = {
      // Tilde is handled in the range returned by getDependencyMaximumVersionRange
      enforceTildeRange: false,
      inManifest: [inManifest],
      requireInstall: isInstallRequired(name)
    };
    return acc;
  }, {} as Record<T, DependencyToAdd>);
  const devDependenciesInfo = devDependenciesToInstall.reduce((acc, name) => {
    const rootVersion = [
      name,
      ...name.startsWith('@angular/') ? ['@angular/core'] : [],
      ...name.startsWith('@angular-devkit/') && name !== '@angular-devkit/architect' ? ['@angular-devkit/core'] : [],
      ...name.startsWith('@ngrx/') ? ['@ngrx/store'] : []
    ]
      .map((packageName) => getVersionToInstallFromPackageJson(packageName, rootPath, false))
      .find((version) => typeof version === 'string');
    let range = rootVersion || getVersionToInstallFromPackageJson(name, o3rPackageJsonPath, true);
    if (typeof range !== 'string') {
      logger?.warn(`Unable to retrieve version for ${name} in ${o3rPackageJsonPath}. Version set to "latest".`);
      range = 'latest';
    }

    const inManifest = {
      range,
      types: [NodeDependencyType.Dev]
    };
    if (isDependencyAlreadyInstalled(name, projectPackageJson, inManifest)) {
      return acc;
    }

    acc[name] = {
      // Tilde is handled in the range returned by getDependencyMaximumVersionRange
      enforceTildeRange: false,
      inManifest: [inManifest],
      requireInstall: isInstallRequired(name)
    };

    return acc;
  }, {} as Record<U, DependencyToAdd>);
  return { ...peerDependenciesInfo, ...devDependenciesInfo };
}
