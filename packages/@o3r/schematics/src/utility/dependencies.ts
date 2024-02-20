import * as fs from 'node:fs';
import { NodeDependency, NodeDependencyType } from '@schematics/angular/utility/dependencies';

/**
 *  Method to extract the provided package version range from a package.json file
 *  @param packageNames list of package we want to retrieve the version
 *  @param packageJsonPath Path to the package.json to refer to
 *  @returns The version range value retrieved from the provided package.json file
 */
export function getExternalDependenciesVersionRange<T extends string>(packageNames: T[], packageJsonPath: string): Record<T, string> {
  const packageJsonContent = JSON.parse(fs.readFileSync(packageJsonPath, {encoding: 'utf-8'}));
  return packageNames.reduce((acc: Partial<Record<T, string>>, packageName) => {
    acc[packageName] = packageJsonContent.peerDependencies?.[packageName] || packageJsonContent.generatorDependencies?.[packageName] || packageJsonContent.dependencies?.[packageName] || 'latest';
    return acc;
  }, {}) as Record<T, string>;
}

/**
 * Method used to build the list of node dependencies to be installed
 * @param dependenciesVersions map of dependency and its associated required version
 * @param type node type of the dependency
 * @returns the list of node dependencies to be installed
 */
export function getNodeDependencyList<T extends string>(dependenciesVersions: Record<T, string>, type: NodeDependencyType): NodeDependency[] {
  return Object.entries<string>(dependenciesVersions).map(([name, version]) => ({name, version, type, overwrite: true}));
}
