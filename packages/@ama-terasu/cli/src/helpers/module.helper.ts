import * as chalk from 'chalk';
import { exec } from 'node:child_process';
import { existsSync, promises as fs } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { promisify } from 'node:util';
import { readFileSync } from 'node:fs';
import type { PackageJson } from 'type-fest';
import { getAvailableModules, NpmRegistryPackage } from '@o3r/schematics';
import { dependencies, devDependencies, peerDependencies } from '../../package.json';

const moduleScopeWhitelist = ['@o3r', '@ama-sdk', '@ama-des'];

/** Minimal information of a package (common between package.json and npm search result) */
export type MinimalPackageInformation = Pick<PackageJson, 'name' | 'description' | 'keywords' | 'maintainers' | 'version'>;

/** Additional information provided by the `npm search` command */
export interface NpmSearchSpecificInformation {
  /** Scope of the NPM package */
  scope?: string;
  /** Date of the publication of the retrieve version */
  date: Date;
  /** Links provided with the current artifact version */
  links: Record<string, string>;
}

/** Package information resulting of a NPM search command */
export type SearchResult = MinimalPackageInformation & NpmSearchSpecificInformation;

/** Information determine for a parsed module */
export interface ModuleLoadedInformation {
  /** Name of the NPM Package */
  name: string;

  /** Simplified name as displayed in the interface and selectable by the user */
  moduleName: string;

  /** Determine if the package is officially supported by the Otter (and affiliated) Teams */
  isOfficialModule: boolean;
}

/** Installed package information */
export interface InstalledModuleInformation {
  /** Path to the installed package (can be in CLI node_modules or in dynamic imported node_modules) */
  resolutionPath: string;

  /** Local package.json */
  package: PackageJson;
}

/** Module discovered */
export type ModuleDiscovery = MinimalPackageInformation & ModuleLoadedInformation & Partial<InstalledModuleInformation>;

/** Keyword to identify a module */
export const MODULES_KEYWORD = 'amaterasu-module';

/** List of official scopes of modules supported by Otter (and affiliated) Teams */
export const OFFICIAL_MODULE_SCOPES = ['ama-terasu', 'ama-sdk', 'o3r', 'otter'] as const;
const officialModuleScopeRegExps = OFFICIAL_MODULE_SCOPES.map((s) => new RegExp(`^@${s}/`));

/** Folder containing the dependency installed dynamically */
export const DYNAMIC_DEPENDENCIES_FOLDER = 'dyn_modules';
const dynamicDependenciesPath = resolve(__dirname, '..', '..', DYNAMIC_DEPENDENCIES_FOLDER);

/**
 * Find the closest package.json file in parent folders
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
 * @param packageName Name of a dependency package
 * @returns the package information or undefined if not found
 */
export const getDepPackage = (packageName: string): PackageJson | undefined => {
  try {
    const packageJsonPath = findClosestPackageJson(require.resolve(packageName));
    return packageJsonPath && JSON.parse(readFileSync(packageJsonPath, {encoding: 'utf-8'}));
  } catch {
    return undefined;
  }
};

/**
 * Get the path to the installed package
 * @param dep dependency to retrieve in the installed packages
 * @param useFsToSearch Use File System access to search for the package instead of Node resolve mechanism
 */
export const getInstalledInformation = async (dep: MinimalPackageInformation & { name: string }, useFsToSearch = false): Promise<InstalledModuleInformation | undefined> => {
  const dynModule = resolve(dynamicDependenciesPath, 'node_modules');
  try {
    let fsDiscoveredPath: string | undefined;
    if (useFsToSearch) {
      const localPath = resolve(dynModule, dep.name, 'package.json');
      fsDiscoveredPath = existsSync(localPath) ? resolve(dynModule, dep.name, JSON.parse(await fs.readFile(localPath, {encoding: 'utf-8'})).main) : undefined;
    }
    const resolutionPath = fsDiscoveredPath || require.resolve(dep.name, {
      paths: [
        dynModule,
        ...module.paths
      ]
    });

    const packageJsonPath = findClosestPackageJson(resolutionPath);
    if (!resolutionPath || !packageJsonPath) {
      return;
    }
    return {
      package: JSON.parse(await fs.readFile(packageJsonPath, { encoding: 'utf-8' })),
      resolutionPath
    };
  } catch {
    return;
  }
};


/**
 * Get the module simplified name
 * @param pck package to get name from
 */
export const getSimplifiedName = (pck: MinimalPackageInformation & { name: string }) => {
  return /(?:@[^/]+[/])?(?:amaterasu-)?(.*)/.exec(pck.name)?.[1] || pck.name;
};

/**
 * Determine if the module is officially supported by Otter (or affiliated) teams
 * @param pck package to get name from
 */
export const isOfficialModule = (pck: MinimalPackageInformation & { name: string }) => {
  return officialModuleScopeRegExps.some((scope) => scope.test(pck.name));
};

/**
 * Retrieve the list of all the dependencies
 */
export const getLocalDependencies = async (): Promise<Record<string, string>> => {
  const dynDependencies: Record<string, string> = existsSync(resolve(dynamicDependenciesPath, 'package.json')) &&
    JSON.parse(await fs.readFile(resolve(dynamicDependenciesPath, 'package.json'), { encoding: 'utf-8' })).dependencies || {};
  return {
    ...dynDependencies,
    ...peerDependencies,
    ...devDependencies,
    ...dependencies
  };
};

/**
 * Retrieve the list of modules registered to Amaterasu CLI
 * @param options Options for the module resolution
 * @param options.localOnly Resolve module locally only
 * @returns list of modules to load
 */
export const getCliModules = async (options: { localOnly: boolean } = { localOnly: false }): Promise<ModuleDiscovery[]> => {
  let remoteModules: NpmRegistryPackage[] = [];
  const localDependencies = await getLocalDependencies();
  const explicitModules = Object.keys(localDependencies)
    .map((moduleName) => getDepPackage(moduleName))
    .filter((modulePackageJson): modulePackageJson is PackageJson => {
      const { keywords } = modulePackageJson || { keywords: undefined };
      return !!keywords && keywords.includes(MODULES_KEYWORD);
    });

  if (!options.localOnly) {
    try {
      remoteModules = await getAvailableModules(MODULES_KEYWORD, moduleScopeWhitelist);
    } catch {
      console.warn('Failed to execute `npm search`, will contains only installed packages');
    }
  }

  const map = new Map<string, ModuleDiscovery>();
  const modules = [...explicitModules, ...remoteModules]
    .filter((mod): mod is typeof mod & { name: string } => !!mod.name);

  for (const mod of modules) {
    const localInformation = await getInstalledInformation(mod);
    map.set(mod.name, {
      ...mod,
      ...localInformation,
      moduleName: getSimplifiedName(mod),
      isOfficialModule: isOfficialModule(mod)
    });
  }

  return [ ...map.values() ];
};

/**
 * Determine if the package is installed
 * @param pck package to get name from
 */
export const isInstalled = (pck: ModuleDiscovery): pck is ModuleDiscovery & InstalledModuleInformation => {
  return !!(pck.resolutionPath && pck.package);
};

/**
 * Formatted description
 * @param pck package to get name from
 */
export const getFormattedDescription = (pck: ModuleDiscovery): string => {
  return (isInstalled(pck) ? '' : `${chalk.grey.italic('(remote)')} `) + (pck.description || '<Missing description>') + (pck.isOfficialModule ? ` ${chalk.blue(String.fromCharCode(0x00AE))}` : '');
};

/**
 * Install a specific package
 * @param pck Package to install
 * @param version Version of the package to install
 */
export const installDependency = async (pck: ModuleDiscovery, version?: string) => {
  if (!existsSync(resolve(dynamicDependenciesPath, 'package.json'))) {
    if (!existsSync(resolve(dynamicDependenciesPath))) {
      await fs.mkdir(dynamicDependenciesPath, { recursive: true });
    }
    await promisify(exec)('npm init --yes', { cwd: dynamicDependenciesPath });
  }
  await promisify(exec)(`npm install --save-exact ${pck.name}@${version || pck.version || 'latest'}`, { cwd: dynamicDependenciesPath });
};
