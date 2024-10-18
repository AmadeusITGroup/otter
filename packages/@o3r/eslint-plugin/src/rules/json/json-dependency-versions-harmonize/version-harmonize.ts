import * as fs from 'node:fs';
import {
  existsSync,
  readFileSync
} from 'node:fs';
import {
  dirname,
  normalize,
  posix,
  resolve
} from 'node:path';
import {
  sync as globbySync
} from 'globby';
import * as semver from 'semver';
import type {
  PackageJson
} from 'type-fest';

/** List of packages information resulting of a package.json discovery */
export interface PackageProperty {
  /** List of package.json file information */
  packages: {
    /** Parsed package.json content */
    content: PackageJson;
    /** Path to the file */
    path: string;
    /** Determine if the package.json has a workspace information */
    isWorkspace?: boolean;
  }[];

  /** Determine if the package.json collection is the result of a default strategy (in the case no matching workspace has been found) */
  hasDefaulted?: boolean;
}

/** Range discovered for a given dependency */
export interface RangeInformation {
  /** Range as specified in the package.json dependencies */
  range: string;
  /** Path to the original package.json */
  path: string;
}

/**
 * Find the closest package.json file containing workspace definition in the parent directories
 * @param directory Current directory to search for
 * @param rootDir First directory of the recursion
 */
export const findWorkspacePackageJsons = (directory: string, rootDir?: string): PackageProperty | undefined => {
  const parentFolder = dirname(directory);
  rootDir ||= directory;
  if (parentFolder === directory) {
    return undefined;
  }
  const packageJsonPath = resolve(directory, 'package.json');
  const content = existsSync(packageJsonPath) && JSON.parse(readFileSync(packageJsonPath, { encoding: 'utf8' })) as PackageJson;
  if (!content || !content.workspaces) {
    return findWorkspacePackageJsons(parentFolder, rootDir);
  }
  const packagePaths = globbySync(
    (Array.isArray(content.workspaces) ? content.workspaces : content.workspaces.packages || []).map((f) => posix.join(f, 'package.json')),
    { cwd: directory, onlyFiles: false, absolute: true, fs }
  );
  const isPackageWorkspace = packagePaths.some((workspacePath) => normalize(workspacePath) === rootDir);
  const getPackages = () => ([
    { content, path: packageJsonPath, isWorkspace: true },
    ...packagePaths.map((subPackageJsonPath) => ({ content: JSON.parse(readFileSync(subPackageJsonPath, { encoding: 'utf8' })) as PackageJson, path: subPackageJsonPath }))
  ]);
  if (isPackageWorkspace) {
    return {
      packages: getPackages()
    };
  } else { // In case we discover a workspace for which the package is not part of
    const parent = findWorkspacePackageJsons(parentFolder, rootDir);
    if (!parent || parent.hasDefaulted) {
      return {
        hasDefaulted: true,
        packages: getPackages()
      };
    }
  }
};

/**
 * Compare and return the best range in the both given onces
 * @param currentRange Current range in the memory stack
 * @param range Range to compare the current one to
 */
export const getBestRange = (currentRange?: string, range?: string) => {
  if (!range || !semver.validRange(range)) {
    return currentRange && semver.validRange(currentRange) ? currentRange : undefined;
  }
  if (!currentRange || !semver.validRange(currentRange)) {
    return range;
  }
  if (currentRange !== range) {
    const minVersion = semver.minVersion(range)!;
    const currentMinVersion = semver.minVersion(currentRange)!;
    if (semver.gt(minVersion, currentMinVersion)) {
      return range;
    } else if (semver.eq(minVersion, currentMinVersion) && semver.subset(range, currentRange)) {
      return range;
    }
  }
  return currentRange;
};

/**
 * Retrieve the best ranges for each dependencies in the given package.json files
 * @param dependencyTypes Type of dependency files to analyze
 * @param packages List of the package.json files
 */
export const getBestRanges = (dependencyTypes: string[], packages: PackageProperty['packages']) => {
  return packages.reduce((acc, pck) => {
    dependencyTypes.forEach((depType) => {
      const dependencies = pck.content[depType];
      if (dependencies) {
        Object.entries(dependencies).forEach(([depName, range]) => {
          if (!acc[depName]) {
            if (range) {
              acc[depName] = { range, path: normalize(pck.path) };
            }
          } else if (getBestRange(acc[depName].range, range) !== acc[depName].range) {
            acc[depName] = { range: range, path: normalize(pck.path) };
          }
        });
      }
    });
    return acc;
  }, {} as Record<string, RangeInformation>);
};
