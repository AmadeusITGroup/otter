import { NpmRegistryPackage, NPMRegistrySearchResponse, OTTER_MODULE_KEYWORD, OTTER_MODULE_PREFIX, OTTER_MODULE_SUPPORTED_SCOPES, OtterModuleTag } from './modules.constants';
import type { IncomingMessage } from 'node:http';
import type { JsonObject, PackageJson } from 'type-fest';
import type { logging } from '@angular-devkit/core';
import { findClosestPackageJson } from '../utility/package-version';
import { satisfies } from 'semver';
import { get } from 'node:https';
import { EOL } from 'node:os';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { promisify } from 'node:util';
import { exec } from 'node:child_process';
import * as chalk from 'chalk';
import { getPackageManager, PackageManagerOptions, SupportedPackageManagerExecutors } from '../utility';

const DEFAULT_NPM_REGISTRY = 'registry.npmjs.org';

async function promiseGetRequest<T extends JsonObject>(url: string) {
  const res = await new Promise<IncomingMessage>((resolve, reject) => get(url, resolve)
    .on('error', (err) => reject(err)));

  return new Promise<T>((resolve, reject) => {
    const data: Buffer[] = [];
    res.on('data', (chunk) => data.push(chunk));
    res.on('end', () => resolve(JSON.parse(Buffer.concat(data).toString())));
    res.on('error', reject);
  });
}

/**
 * Execute NPM search command if not run with other client
 *
 * @param search search text
 * @param packageManager Package manager to use, determined automatically if not specified
 * @param packageManagerOptions
 */
async function npmSearchExec(search: string, packageManagerOptions?: PackageManagerOptions): Promise<NPMRegistrySearchResponse | undefined> {
  const manager = getPackageManager(packageManagerOptions);
  switch (manager) {
    case 'npm': {
      const remoteModulesPromise = promisify(exec)(`npm search "${search}" --json`);
      try {
        const results = JSON.parse((await remoteModulesPromise).stdout) as NpmRegistryPackage[];
        return results
          .reduce((acc, pck) => {
            acc.objects.push({ package: pck });
            return acc;
          }, { objects: [] } as NPMRegistrySearchResponse);
      } catch {
        return undefined;
      }
    }
    default: {
      // Only npm client is supported
      return undefined;
    }
  }
}

/**
 * Determine if the given keyword is an Otter tag
 *
 * @param keyword Keyword to identify
 * @param expect tag expected for the Otter keyword
 */
export const isOtterTag = <T extends string | undefined>(keyword: any, expect?: T): keyword is OtterModuleTag<T extends undefined ? '' : T> => {
  const isTag = typeof keyword === 'string' && keyword.startsWith(OTTER_MODULE_PREFIX);
  return (isTag && expect && keyword === `${OTTER_MODULE_PREFIX}${expect}`) || isTag;
};

/** Options for getAvailableModules function */
export interface AvailableModuleOptions extends PackageManagerOptions {
  /**
   * Determine if only the packages that are NOT installed should be returned
   *
   * @default false
   */
  onlyNotInstalled?: boolean;

  /**
   * Npm Registry to fetch to get the package information
   *
   * @default registry.npmjs.org
   */
  npmRegistryToFetch?: string;
}

/**
 * Get Available Otter modules on NPMjs.org
 *
 * @param keyword Keyword to search for Otter modules
 * @param scopeWhitelist List of whitelisted scopes
 * @param options
 */
export async function getAvailableModules(keyword: string, scopeWhitelist: string[] | readonly string[], options?: AvailableModuleOptions): Promise<NpmRegistryPackage[]> {
  const search = `keywords:${keyword}`;
  const npmRegistry = options?.npmRegistryToFetch || DEFAULT_NPM_REGISTRY;
  const registry = await npmSearchExec(search) || await promiseGetRequest<NPMRegistrySearchResponse>(`https://${npmRegistry}-/v1/search?text=${search}&size=250`);

  let packages = registry.objects
    .filter((pck) => pck.package?.scope && scopeWhitelist.includes(pck.package?.scope))
    .map((pck) => pck.package!);

  if (options?.onlyNotInstalled) {
    packages = packages
      .filter((pck) => {
        try {
          require.resolve(path.posix.join(pck.name, 'package.json'));
          return false;
        } catch {
          return true;
        }
      });
  }

  return packages;
}

/** Options for getAvailableModulesWithLatestPackage function */
export interface AvailableModuleOptionsWithLatestPackage extends AvailableModuleOptions {
  /** Logger to use to report call failure (as debug message) */
  logger?: logging.LoggerApi;

  /**
   * List of whitelisted scopes
   *
   * @default {@see OTTER_MODULE_SUPPORTED_SCOPES}
   */
  scopeWhitelist?: string[] | readonly string[];
}

/**
 * Get Available Otter modules on NPMjs.org and get latest package information
 * Similar to {@link getAvailableModules} with additional calls to retrieve all the package's information
 *
 * @param keyword Keyword to search for Otter modules
 * @param options
 */
export async function getAvailableModulesWithLatestPackage(keyword: string = OTTER_MODULE_KEYWORD, options: AvailableModuleOptionsWithLatestPackage): Promise<NpmRegistryPackage[]> {
  const scopeWhitelist = options.scopeWhitelist || OTTER_MODULE_SUPPORTED_SCOPES;
  const packages = await getAvailableModules(keyword, scopeWhitelist, options);
  const npmRegistry = options?.npmRegistryToFetch || DEFAULT_NPM_REGISTRY;

  return Promise.all(
    packages
      .map(async (pck) => {
        try {
          const pckInfo = await promiseGetRequest<PackageJson>(`https://${npmRegistry}/${pck.name}/latest`);
          return {
            ...pck,
            package: pckInfo
          };
        } catch {
          options.logger?.debug(`Failed to retrieve information for ${pck.name}`);
          return pck;
        }
      })
  );
}

/**
 * Format a module description to be displayed in the terminal
 *
 * @param npmPackage Npm Package to display
 * @param runner runner according to the context
 * @param keywordTags Mapping of the NPM package Keywords and a displayed tag
 * @param logger Logger to use to report package read failure (as debug message)
 */
export function formatModuleDescription(npmPackage: NpmRegistryPackage, runner: SupportedPackageManagerExecutors = 'npx', keywordTags: Record<string, string> = {}, logger?: logging.LoggerApi) {
  let otterVersion: string | undefined;
  const otterCorePackageName = '@o3r/core';
  const otterCoreRange = npmPackage.package?.peerDependencies?.[otterCorePackageName];

  if (npmPackage.package) {
    try {
      const otterCorePackage = findClosestPackageJson(require.resolve(otterCorePackageName));
      if (otterCorePackage) {
        const { version } = JSON.parse(fs.readFileSync(otterCorePackage, { encoding: 'utf-8' })) as PackageJson;
        otterVersion = version;
      }
    } catch {
      logger?.debug('Fail to find local Otter installation');
    }
  }

  const flags = npmPackage.keywords
    ?.filter((key) => isOtterTag(key) && key !== OTTER_MODULE_KEYWORD)
    .map((key) => keywordTags[key] || key.replace(OTTER_MODULE_PREFIX, '')) || [];

  const outdatedWarning = otterVersion && otterCoreRange && !satisfies(otterVersion, otterCoreRange) ? ' ' + chalk.yellow(`(outdated, supporting ${otterCoreRange})`) : '';

  const lines = [
    chalk.bold(`${runner} ng add ${chalk.cyan(npmPackage.name)}`) + outdatedWarning,
    chalk.italic(npmPackage.description || '<no description>'),
    ...(npmPackage.links?.npm ? [chalk.italic.grey(`(details on ${npmPackage.links.npm})`)] : []),
    ...(flags.length > 0 ? [`Tags: ${flags.map((flag) => chalk.cyan(flag)).join(', ')}`] : [])
  ];
  return lines.join(EOL);
}
