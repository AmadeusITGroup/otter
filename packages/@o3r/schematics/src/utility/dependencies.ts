import * as fs from 'node:fs';
import {NodeDependency, NodeDependencyType} from '@schematics/angular/utility/dependencies';

/**
 *  Method to extract the provided package version range from a package.json file
 *
 *  @param packageNames list of package we want to retrieve the version
 *  @param packageJsonPath Path to the package.json to refer to
 *  @returns The version range value retrieved from the provided package.json file
 */
export function getExternalDependenciesVersionRange(packageNames: string[], packageJsonPath: string): Record<string, string> {
  try {
    const packageJsonContent = JSON.parse(fs.readFileSync(packageJsonPath, {encoding: 'utf-8'}));
    return packageNames.reduce((acc: Record<string, string>, packageName: string) => {
      acc[packageName] = packageJsonContent.generatorDependencies[packageName];
      return acc;
    }, {});
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('failed to parse package.json', e);
    return {};
  }
}

/**
 * Method used to build the list of node dependencies to be installed
 *
 * @param dependenciesVersions map of dependency and its associated required version
 * @param type node type of the dependency
 * @returns the list of node dependencies to be installed
 */
export function getNodeDependencyList(dependenciesVersions: Record<string, string>, type: NodeDependencyType): NodeDependency[] {
  return Object.entries(dependenciesVersions).map(([name, version]) => ({name, version, type, overwrite: true}));
}
