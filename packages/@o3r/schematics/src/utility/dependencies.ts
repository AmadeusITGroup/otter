import * as fs from 'node:fs';
import {
  logging,
} from '@angular-devkit/core';
import {
  NodeDependency,
  NodeDependencyType,
} from '@schematics/angular/utility/dependencies';
import {
  satisfies,
  subset,
} from 'semver';
import type {
  PackageJson,
} from 'type-fest';
import {
  DependencyToAdd,
} from '../interfaces/dependencies';

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
    acc[packageName] = packageJsonContent.generatorDependencies?.[packageName]
      || packageJsonContent.peerDependencies?.[packageName]
      || packageJsonContent.dependencies?.[packageName]
      || packageJsonContent.devDependencies?.[packageName];
    if (!acc[packageName]) {
      logger?.warn(`Unable to retrieve version for ${packageName} in ${packageJsonPath}. Version set to "latest".`);
      acc[packageName] = 'latest';
    }
    return acc;
  }, {}) as Record<T, string>;
}

export const isAngularDependency = (name: string) => name.match(/^@angular/);

/**
 * Method to retrieve the dependency information for a given dependency
 * @param depInfo
 * @param depInfo.depName
 * @param depInfo.depType
 * @param depInfo.requestedRange
 * @param depInfo.enforceTildeRange
 * @param depInfo.requireInstall
 * @param packageJson
 * @param projectType
 */
export function getExternalDependencyInfo({ depName, depType, requestedRange, enforceTildeRange, requireInstall }: {
  depName: string; depType: NodeDependencyType; requestedRange: string; enforceTildeRange?: boolean; requireInstall?: boolean; },
  packageJson: PackageJson, projectType: 'application' | 'library' | undefined): DependencyToAdd | undefined {
  const packageJsonDepVersion = packageJson.dependencies?.[depName]
    || (depType === NodeDependencyType.Default ? packageJson.peerDependencies?.[depName] : packageJson.devDependencies?.[depName]);
  if (packageJsonDepVersion
    && (satisfies(packageJsonDepVersion, requestedRange) || subset(packageJsonDepVersion, requestedRange))) {
    return undefined;
  }
  return {
    inManifest: [{
      range: requestedRange,
      types: depType === NodeDependencyType.Dev
        ? [depType]
        : (projectType === 'application' ? [NodeDependencyType.Default] : [NodeDependencyType.Peer, NodeDependencyType.Dev])
    }],
    enforceTildeRange,
    requireInstall
  };
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
 * @param params.projectPackageJsonPath - The path to the package json of the project where the dependencies will be installed.
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
    projectPackageJsonPath,
    projectType
  }: {
    dependenciesToInstall: T[];
    devDependenciesToInstall: U[];
    o3rPackageJsonPath: string;
    projectPackageJsonPath: string;
    projectType: 'application' | 'library' | undefined;
  },
  logger?: logging.LoggerApi,
  shouldEnforceTildeRange = (name: string) => !isAngularDependency(name),
  isInstallRequired = (_: string): undefined | boolean => undefined
): Record<T | U, DependencyToAdd> {
  const projectPackageJson = JSON.parse(fs.readFileSync(projectPackageJsonPath, { encoding: 'utf8' })) as PackageJson & {
    generatorDependencies: Record<string, string>;
  };
  const externalVersionRanges = getExternalDependenciesVersionRange(
    [...dependenciesToInstall, ...devDependenciesToInstall],
    o3rPackageJsonPath,
    logger
  );

  const peerDependenciesInfo = dependenciesToInstall.reduce((acc, name) => {
    const dependencyInfo = getExternalDependencyInfo({
      depName: name,
      depType: NodeDependencyType.Default,
      requestedRange: externalVersionRanges[name],
      enforceTildeRange: shouldEnforceTildeRange(name),
      requireInstall: isInstallRequired(name)
    },
    projectPackageJson,
    projectType
    );
    if (dependencyInfo) {
      acc[name] = dependencyInfo;
    }
    return acc;
  }, {} as Record<T, DependencyToAdd>);
  const devDependenciesInfo = devDependenciesToInstall.reduce((acc, name) => {
    const dependencyInfo = getExternalDependencyInfo({
      depName: name,
      depType: NodeDependencyType.Dev,
      requestedRange: externalVersionRanges[name],
      requireInstall: isInstallRequired(name),
      enforceTildeRange: shouldEnforceTildeRange(name)
    },
    projectPackageJson,
    projectType
    );
    if (dependencyInfo) {
      acc[name] = dependencyInfo;
    }
    return acc;
  }, {} as Record<U, DependencyToAdd>);
  return { ...peerDependenciesInfo, ...devDependenciesInfo };
}
