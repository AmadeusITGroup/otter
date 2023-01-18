import * as chalk from 'chalk';
import { existsSync } from 'node:fs';
import { EOL } from 'node:os';
import { dirname, join } from 'node:path';
import { name, version } from '../../package.json';
import { formatTitle } from './format.helper';

/** Keyword to identify a module */
const moduleKeyword = 'amaterasu-module';

/**
 * Find the closest package.json file in parent folders
 *
 * @param currentPath current path to inspect
 * @returns
 */
export const findClosestPackageJson = (currentPath: string): string | undefined => {
  const dir = dirname(currentPath);
  if (dir === currentPath) {
    return undefined;
  }

  const packageJsonPath = join(dir, 'package.json');
  return existsSync(packageJsonPath) ? packageJsonPath : findClosestPackageJson(dir);
};

/**
 * Retrieve package.json from a dependency
 *
 * @param packageName Name of a dependency package
 * @returns the package information or undefined if not found
 */
export const getDepPackage = (packageName: string): { keywords?: string[]; version: string } | undefined => {
  try {
    const packageJsonPath = findClosestPackageJson(require.resolve(packageName));
    return packageJsonPath && require(packageJsonPath);
  } catch {
    return undefined;
  }
};

/**
 * Retrieve the version of a dependency package
 *
 * @param packageName Name of a dependency package
 * @returns the package version or undefined if not found
 */
export const getDepPackageVersion = (packageName: string): string | undefined => {
  // eslint-disable-next-line @typescript-eslint/no-shadow
  const { version } = getDepPackage(packageName) || { version: undefined };
  return version;
};

/**
 * Retrieve the version of a dependency package with a nice formatting
 *
 * @param packageName Name of a dependency package
 * @returns the package version or undefined if not found
 */
export const getPackageFormattedVersion = (packageName: string): string | undefined => {
  const pckVersion = getDepPackageVersion(packageName);
  return pckVersion && `${packageName}: ${chalk.grey(pckVersion)}`;
};

/**
 * Retrieve the list of modules registered to Amaterasu CLI
 *
 * @param cliModules List of modules to load
 * @param dependencies list of the CLI dependencies
 * @returns list of modules to load
 */
export const getCliModules = (cliModules: string[], dependencies: Record<string, string>): string[] => {
  const implicitModules = Object.keys(dependencies)
    .filter((key) => !cliModules.includes(key))
    .filter((moduleName) => {
      const { keywords } = getDepPackage(moduleName) || { keywords: undefined };
      return keywords && keywords.includes(moduleKeyword);
    });
  return [
    ...cliModules,
    ...implicitModules
  ];
};

/**
 * Get message of the --version command which includes all the modules versions
 *
 * @param packageName Name of a dependency package
 * @param cliModules
 * @returns the package version or undefined if not found
 */
export const getPackageVersion = (cliModules: string[]) => {
  const lines = [
    chalk.bold(`${name}: ${chalk.grey(version)}`),
    ''
  ];
  const modules = cliModules
    .map((modName) => getPackageFormattedVersion(modName))
    .filter((line): line is string => !!line);

  if (modules.length) {
    lines.push(
      formatTitle('Modules'),
      ...modules,
      ''
    );
  }

  return lines.join(EOL);
};
