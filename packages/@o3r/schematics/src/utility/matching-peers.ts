import * as fs from 'node:fs';
import { PackageJson } from 'type-fest';


/**
 * Retrieve the peer dependency version for a package
 *
 * @param packageJsonPath path of the package json where to resolve the dependency
 * @param packageName name of the peer dependency to be resolved
 */
export function getPeerDepVersion(packageJsonPath: string, packageName: string) {
  const packageJsonContent: PackageJson = JSON.parse(fs.readFileSync(packageJsonPath, { encoding: 'utf-8' }));
  return packageJsonContent.peerDependencies?.[packageName];
}

/**
 * Retrieve the peer dependencies with the given pattern from the given package json file
 *
 * @param packageJsonPath
 * @param pattern
 */
export function getPeerDepWithPattern(packageJsonPath: string, pattern = /^@(otter|o3r|ama-sdk)/) {
  const packageJsonContent: PackageJson = JSON.parse(fs.readFileSync(packageJsonPath, { encoding: 'utf-8' }));
  const packageName = packageJsonContent.name;
  const packageVersion = packageJsonContent.version;
  const optionalPackages = Object.entries(packageJsonContent.peerDependenciesMeta || {})
    .filter(([, dep]) => dep?.optional)
    .map(([depName]) => depName);

  const matchingPackages = Object.keys(packageJsonContent.peerDependencies || [])
    .filter(peerDep => pattern.test(peerDep) && !optionalPackages.includes(peerDep));

  return { packageName, packageVersion, matchingPackages };
}

/**
 * Get the list of o3r peer deps from a given package.json file
 *
 * @param packageJsonPath The package json on which we search for o3r peer deps
 * @param filterBasics If activated it will remove the basic peer deps (o3r/core, o3r/dev-tools and o3r/schematics) from the list of results
 * @param packagePattern Pattern of the package name to look in the packages peer dependencies.
 */
export function getO3rPeerDeps(packageJsonPath: string, filterBasics = true, packagePattern = /^@(?:o3r|ama-sdk)/) {
  const depsInfo = getPeerDepWithPattern(packageJsonPath, packagePattern);
  return {
    packageName: depsInfo.packageName,
    packageVersion: depsInfo.packageVersion,
    o3rPeerDeps: filterBasics ?
      depsInfo.matchingPackages.filter(peerDep => peerDep !== '@o3r/core' && peerDep !== '@o3r/schematics' && peerDep !== '@o3r/dev-tools')
      : depsInfo.matchingPackages
  };

}
