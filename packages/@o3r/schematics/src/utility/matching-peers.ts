import * as fs from 'node:fs';
import type { PackageJson } from 'type-fest';

/**
 * Retrieve the peer dependencies with the given pattern from the given package json file
 * @param packageJsonPath
 * @param pattern
 */
export function getPeerDepWithPattern(packageJsonPath: string, pattern: RegExp | string[] = /^@(otter|o3r|ama-sdk)/) {
  const packageJsonContent: PackageJson = JSON.parse(fs.readFileSync(packageJsonPath, { encoding: 'utf-8' }));
  const packageName = packageJsonContent.name;
  const packageVersion = packageJsonContent.version;
  const optionalPackages = Object.entries(packageJsonContent.peerDependenciesMeta || {})
    .filter(([, dep]) => dep?.optional)
    .map(([depName]) => depName);

  const matchingPackagesVersions = Object.fromEntries(
    Object.entries(packageJsonContent.peerDependencies || {})
      .filter(([peerDep]) => (Array.isArray(pattern) ? pattern.includes(peerDep) : pattern.test(peerDep)) && !optionalPackages.includes(peerDep))
  );
  const matchingPackages = Object.keys(matchingPackagesVersions);

  return { packageName, packageVersion, matchingPackages, matchingPackagesVersions };
}

const basicsPackageName = new Set([
  '@o3r/core',
  '@o3r/schematics',
  '@o3r/dev-tools',
  '@o3r/workspace'
]);

/**
 * Get the list of o3r peer deps from a given package.json file
 * @param packageJsonPath The package json on which we search for o3r peer deps
 * @param filterBasics If activated it will remove the basic peer deps (o3r/core, o3r/dev-tools, o3r/workspace and o3r/schematics) from the list of results
 * @param packagePattern Pattern of the package name to look in the packages peer dependencies.
 * @param versionRangePrefix Prefix to add to the package version to determine Semver Range
 */
export function getO3rPeerDeps(packageJsonPath: string, filterBasics = true, packagePattern = /^@(?:o3r|ama-sdk)/, versionRangePrefix = '') {
  const depsInfo = getPeerDepWithPattern(packageJsonPath, packagePattern);
  return {
    packageName: depsInfo.packageName,
    packageVersion: versionRangePrefix + depsInfo.packageVersion,
    o3rPeerDeps: filterBasics ?
      depsInfo.matchingPackages.filter((peerDep) => !basicsPackageName.has(peerDep))
      : depsInfo.matchingPackages
  };

}

/**
 * Get the list of o3r generator deps from a given package.json file
 * @param packageJsonPath The package json on which we search for o3r generator deps
 * @param packagePattern Pattern of the package name to look in the packages generator dependencies.
 */
export function getO3rGeneratorDeps(packageJsonPath: string, packagePattern = /^@(?:o3r|ama-sdk)/) {
  const packageJsonContent: PackageJson = JSON.parse(fs.readFileSync(packageJsonPath, { encoding: 'utf-8' }));
  const packageName = packageJsonContent.name;
  const packageVersion = packageJsonContent.version;
  const optionalPackages = Object.entries(packageJsonContent.generatorDependencies || {})
    .filter(([, dep]) => dep?.optional)
    .map(([depName]) => depName);

  const o3rGeneratorDeps = Object.keys(packageJsonContent.peerDependencies || [])
    .filter(peerDep => packagePattern.test(peerDep) && !optionalPackages.includes(peerDep));

  return { packageName, packageVersion, o3rGeneratorDeps };

}
