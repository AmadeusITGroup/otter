import * as chalk from 'chalk';
import { exec } from 'node:child_process';
import { existsSync, promises as fs } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { promisify } from 'node:util';
import type { PackageJson } from 'type-fest';

/** Package information resulting of a NPM search command */
export type SearchResult = Pick<PackageJson, 'name' | 'description' | 'keywords' | 'maintainers' | 'version'> & { scope: string; date: Date; links: Record<string, string> };

/** Module discovered */
export type ModuleDiscovery = (PackageJson | SearchResult) & { name: string; moduleName: string; resolutionPath: string | null };

/** List of the discovered modules */
export type ModuleDiscoveryList = ModuleDiscovery[];

/** Keyword to identify a module */
export const moduleKeyword = 'amaterasu-module';

/** Folder containing the dependency installed dynamically */
export const dynamicDependenciesFolder = 'dyn_modules';
const dynamicDependenciesPath = resolve(__dirname, '..', '..', dynamicDependenciesFolder);

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
export const getDepPackage = (packageName: string): PackageJson | undefined => {
  try {
    const packageJsonPath = findClosestPackageJson(require.resolve(packageName));
    return packageJsonPath && require(packageJsonPath);
  } catch {
    return undefined;
  }
};

/**
 * Get the path to the installed package
 *
 * @param dep dependency to retrieve in the installed packages
 */
export const getInstalledPath = (dep: (PackageJson | SearchResult) & { name: string }) => {
  try {
    const resolvedPath = require.resolve(dep.name, {
      paths: [
        resolve(dynamicDependenciesPath, 'node_modules'),
        ...module.paths
      ]
    });

    return resolvedPath || null;
  } catch {
    return null;
  }
};


/**
 * Get the module simplified name
 *
 * @param pck package to get name from
 */
export const getSimplifiedName = (pck: (PackageJson | SearchResult) & { name: string }) => {
  return /(?:@[^/]+[/])?(?:amaterasu-)?(.*)/.exec(pck.name)?.[1] || pck.name;
};

/**
 * Retrieve the list of modules registered to Amaterasu CLI
 *
 * @param dependencies list of the CLI dependencies
 * @param options Options for the module resolution
 * @param options.localOnly Resolve module locally only
 * @returns list of modules to load
 */
export const getCliModules = async (dependencies: Record<string, string>, options: { localOnly: boolean } = { localOnly: false }): Promise<ModuleDiscoveryList> => {
  const npmModulesPromise = options.localOnly ? Promise.resolve({ stdout: '[]'}) : promisify(exec)(`npm search ${moduleKeyword} --json`);
  const explicitModules = Object.keys(dependencies)
    .map((moduleName) => getDepPackage(moduleName))
    .filter((depModule): depModule is PackageJson => {
      const { keywords } = depModule || { keywords: undefined };
      return !!keywords && keywords.includes(moduleKeyword);
    });

  let npmModules: SearchResult[] = [];
  try {
    npmModules = JSON.parse((await npmModulesPromise).stdout) as SearchResult[];
  } catch {
    console.warn('Failed to execute `npm search`, will contains only installed packages');
  }

  const map = new Map<string, ModuleDiscovery & { name: string }>();
  [...npmModules, ...explicitModules]
    .filter((mod): mod is typeof mod & { name: string } => !!mod.name)
    .forEach((mod) => map.set(mod.name, Object.assign(mod, { resolutionPath: getInstalledPath(mod), moduleName: getSimplifiedName(mod) })));
  return [
    ...map.values()
  ];
};

/**
 * Determine if the package is installed
 *
 * @param pck package to get name from
 */
export const isInstalled = (pck: ModuleDiscovery): pck is ModuleDiscovery & { resolutionPath: string } => {
  return !!pck.resolutionPath;
};

/**
 * Formatted description
 *
 * @param pck package to get name from
 */
export const getFormattedDescription = (pck: ModuleDiscovery): string => {
  return (isInstalled(pck) ? '' : `${chalk.grey.italic('(remote)')} `) + (pck.description || '<Missing description>');
};

/**
 * Install a specific package. Will be ignored if the package is already installed
 *
 * @param pck Package to install
 */
export const installDependency = async (pck: ModuleDiscovery) => {
  if (!isInstalled(pck)) {
    if (!existsSync(resolve(dynamicDependenciesPath, 'package.json'))) {
      if (!existsSync(resolve(dynamicDependenciesPath))) {
        await fs.mkdir(dynamicDependenciesPath, { recursive: true });
      }
      await promisify(exec)('npm init --yes', { cwd: dynamicDependenciesPath });
    }
    await promisify(exec)(`npm install ${pck.name}`, { cwd: dynamicDependenciesPath });
  }
};
