import { sync as globbySync } from 'globby';
import { existsSync } from 'node:fs';
import { dirname, normalize, relative, resolve } from 'node:path';
import { getJestProjects as workspaceGetJestProjects } from '@o3r/workspace';

/**
 * Get the list of Jest Projects in the workspace
 * @deprecated Please use the one exposed in `@o3r/workspace`, will be removed in Otter v12.
 * @param rootPackageJson Path to the root package.json
 * @param rootDir
 * @param jestConfigPattern Pattern to the jest config files
 * @returns list of Jest projects
 */
export const getJestProjects = workspaceGetJestProjects;

/**
 * Find the closest package.json file containing workspace definition in the parent directories
 *
 * @param directory Current directory to search for
 * @param rootDir First directory of the recursion
 */
const findParentPackageJson = (directory: string, rootDir?: string): string | undefined => {
  const parentFolder = dirname(directory);
  rootDir ||= directory;
  if (parentFolder === directory) {
    return undefined;
  }
  const packageJsonPath = resolve(parentFolder, 'package.json');
  if (!existsSync(packageJsonPath) || !(require(packageJsonPath).workspaces)) {
    return findParentPackageJson(parentFolder, rootDir);
  }
  return globbySync(require(packageJsonPath).workspaces, { cwd: parentFolder, onlyFiles: false, absolute: true})
    .some((workspacePath) => normalize(workspacePath) === rootDir) ? packageJsonPath : findParentPackageJson(parentFolder, rootDir);
};

/**
 * Get the list of modules mapping
 * @deprecated Please use `pathsToModuleNameMapper` from `ts-jest`, will be removed in Otter v12.
 * @param rootDir Root directory of the jest project
 * @param testingTsconfigPath Path to the tsconfig.json used for test mapping files
 * @returns
 */
export const getJestModuleNameMapper = (rootDir: string, testingTsconfigPath?: string) => {
  const workspacePackageJsonPath = findParentPackageJson(rootDir);
  const workspacePath = workspacePackageJsonPath ? dirname(workspacePackageJsonPath) : process.cwd();
  testingTsconfigPath ||= resolve(workspacePath, 'tsconfig.base.json');

  if (!existsSync(testingTsconfigPath)) {
    console.warn(`${testingTsconfigPath} not found`);
    return {};
  }
  const { compilerOptions } = require(testingTsconfigPath) as { compilerOptions: { paths: { [key: string]: string[] } } };
  const relativePath = relative(rootDir, workspacePath);
  return Object.entries(compilerOptions.paths).reduce<Record<string, any>>((acc, [keyPath, mapPaths]) => {
    const relativeModulePath = mapPaths.map((mapPath) => `<rootDir>/${relativePath.replace(/\\+/g, '/') || ''}/${mapPath.replace(/[*]/g, '$1')}`.replace(/\/{2,}/g, '/'));
    acc['^' + keyPath.replace(/[*]/g, '(.*)') + '$'] = relativeModulePath;
    return acc;
  }, {});
};
