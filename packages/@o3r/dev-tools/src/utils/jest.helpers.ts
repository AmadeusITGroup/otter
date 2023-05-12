import { sync as globbySync } from 'globby';
import { existsSync } from 'node:fs';
import { dirname, normalize, posix, relative, resolve } from 'node:path';

/**
 * Get the list of Jest Projects in the workspace
 *
 * @param rootPackageJson Path to the root package.json
 * @param rootDir
 * @param jestConfigPattern Pattern to the jest config files
 * @returns list of Jest projects
 */
export const getJestProjects = (rootDir = process.cwd(), jestConfigPattern = 'jest.config.{j,t}s') => {
  const rootPackageJson = resolve(rootDir, 'package.json');
  if (!existsSync(rootPackageJson)) {
    console.warn(`No package.json found in ${rootDir}`);
    return [];
  }
  const jestConfigPatterns: string[] | undefined = require(rootPackageJson).workspaces?.map((packagePath: string) => posix.join(packagePath, jestConfigPattern));
  const jestConfigFileLists = jestConfigPatterns?.map((pattern) => globbySync(pattern, { cwd: rootDir }));
  return jestConfigFileLists
    ?.flat()
    .map((jestConfigFile) => posix.join('<rootDir>', jestConfigFile.replace(/jest\.config\.[jt]s$/, '')).replace(/\\+/g, '/'));
};

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
 *
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
