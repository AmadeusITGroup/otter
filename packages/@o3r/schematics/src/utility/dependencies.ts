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
 * @param packageNames list of package we want to retrieve the version
 * @param packageJsonPath Path to the package.json to refer to
 * @param logger logger
 * @returns The version range value retrieved from the provided package.json file
 */
export function getExternalDependenciesVersionRange<T extends string>(packageNames: T[], packageJsonPath: string, logger?: logging.LoggerApi): Record<T, string> {
  const packageJsonContent = JSON.parse(fs.readFileSync(packageJsonPath, { encoding: 'utf8' })) as PackageJson & {
    generatorDependencies: Record<string, string>;
  };
  return packageNames.reduce((acc: Partial<Record<T, string>>, packageName) => {
    acc[packageName] = packageJsonContent.generatorDependencies?.[packageName];
    if (!acc[packageName]) {
      const rangeSortedByHighestMinimum = [
        packageJsonContent.peerDependencies?.[packageName],
        packageJsonContent.dependencies?.[packageName],
        packageJsonContent.devDependencies?.[packageName]
      ]
        .filter((packageVersion): packageVersion is string =>
          valid(packageVersion) !== null || validRange(packageVersion) !== null
        )
        .sort((versionA, versionB) => {
          const minVersionA = minVersion(versionA)!;
          const minVersionB = minVersion(versionB)!;
          if (gt(minVersionB, minVersionA)) {
            return 1;
          } else if (gt(minVersionA, minVersionA)) {
            return -1;
          }
          return 0;
        });
      acc[packageName] = rangeSortedByHighestMinimum[0];
    }

    if (!acc[packageName]) {
      logger?.warn(`Unable to retrieve version for ${packageName} in ${packageJsonPath}. Version set to "latest".`);
      acc[packageName] = 'latest';
    }
    return acc;
  }, {}) as Record<T, string>;
}

export const isAngularDependency = (name: string) => name.match(/^@angular/);

/**
 * Check if a dependency has already been installed for the requested range
 * @param depName
 * @param packageJson
 * @param root0
 * @param root0.range
 * @param root0.types
 */
export function isDependencyAlreadyInstalled(depName: string, packageJson: PackageJson, { range, types }: Required<DependencyInManifest>) {
  const packageJsonDepVersion = types?.map((type) => packageJson[type]).find((dep) => !!dep?.[depName])?.[depName];
  return packageJsonDepVersion && (satisfies(packageJsonDepVersion, range) || subset(packageJsonDepVersion, range));
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
 * @param logger - The logger instance for logging information.
 * @param shouldEnforceTildeRange - Whether the package should be installed with ~ enforcement or not. By default, ~ is enforced for non-angular dependencies
 * @param isInstallRequired - Whether the package should be installed or not. By default, return true.
 */
export function getExternalDependenciesInfo<T extends string, U extends string>(
  {
    dependenciesToInstall,
    devDependenciesToInstall,
    o3rPackageJsonPath,
    projectPackageJson,
    projectType
  }: {
    dependenciesToInstall: T[];
    devDependenciesToInstall: U[];
    o3rPackageJsonPath: string;
    projectPackageJson: PackageJson;
    projectType?: 'application' | 'library';
  },
  logger?: logging.LoggerApi,
  shouldEnforceTildeRange = (name: string) => !isAngularDependency(name),
  isInstallRequired = (_: string): undefined | boolean => undefined
): Record<T | U, DependencyToAdd> {
  if (!projectPackageJson) {
    throw new O3rCliError(`Cannot install a dependency as there is no package.json in the project. ${JSON.stringify(dependenciesToInstall)}
    - Cannot install a dependency as there is no package.json in the project. ${JSON.stringify(devDependenciesToInstall)}`);
  }

  const externalVersionRanges = getExternalDependenciesVersionRange(
    [...dependenciesToInstall, ...devDependenciesToInstall],
    o3rPackageJsonPath,
    logger
  );

  const peerDependenciesInfo = dependenciesToInstall.reduce((acc, name) => {
    const inManifest = {
      range: externalVersionRanges[name],
      types: projectType === 'application' ? [NodeDependencyType.Default] : [NodeDependencyType.Peer, NodeDependencyType.Dev]
    };

    if (isDependencyAlreadyInstalled(name, projectPackageJson, inManifest)) {
      return acc;
    }
    acc[name] = {
      inManifest: [inManifest],
      enforceTildeRange: shouldEnforceTildeRange(name),
      requireInstall: isInstallRequired(name)
    };
    return acc;
  }, {} as Record<T, DependencyToAdd>);
  const devDependenciesInfo = devDependenciesToInstall.reduce((acc, name) => {
    const inManifest = {
      range: externalVersionRanges[name],
      types: [NodeDependencyType.Dev]
    };
    if (isDependencyAlreadyInstalled(name, projectPackageJson, inManifest)) {
      return acc;
    }

    acc[name] = {
      inManifest: [inManifest],
      enforceTildeRange: shouldEnforceTildeRange(name),
      requireInstall: isInstallRequired(name)
    };

    return acc;
  }, {} as Record<U, DependencyToAdd>);
  return { ...peerDependenciesInfo, ...devDependenciesInfo };
}
