import { posix } from 'node:path';
import { logging } from '@angular-devkit/core';
import { execSync } from 'node:child_process';
import type { WorkspaceSchema } from '../interfaces/angular-workspace';

/** Support NPM package managers */
export type SupportedPackageManagers = 'npm' | 'yarn';

/** Support NPM package managers */
export type SupportedPackageManagerRunners = `${SupportedPackageManagers} run` | 'yarn';

/** Support NPM package managers */
export type SupportedPackageManagerExecutors = `${SupportedPackageManagers} exec` | 'yarn' | 'npx';

const PACKAGE_MANAGER_WORKSPACE_MAPPING: Record<SupportedPackageManagers, string> = {
  npm: '--workspace',
  yarn: 'workspace'
};

/** Option to determine Package Manager */
export interface PackageManagerOptions {
  /** Workspace configuration */
  workspaceConfig?: WorkspaceSchema | string | null;

  /** Package manager to enforce, will be used if supported */
  enforcedNpmManager?: string | null;

  /** Logger to use to report call failure (as debug message) */
  logger?: logging.LoggerApi;
}

/**
 * Determine if the given packager manager is supported
 * @param name Name of the package manager
 */
export function isSupportedPackageManager(name?: any): name is SupportedPackageManagers {
  return name === 'yarn' || name === 'npm';
}

/**
 * Get the Package Manager
 * @param enforcedNpmManager package manager to enforce
 */
function getPackageManagerName(enforcedNpmManager?: SupportedPackageManagers): SupportedPackageManagers {
  const envCustomPackageManager = isSupportedPackageManager(process.env?.ENFORCED_PACKAGE_MANAGER) && process.env.ENFORCED_PACKAGE_MANAGER;
  const envNodePackageManager = process.env?.npm_execpath?.includes('yarn') && 'yarn';
  return enforcedNpmManager || envCustomPackageManager || envNodePackageManager || 'npm';
}

/**
 * Get package manager used in runs
 * Defaults to the package manager setup in process.env if no package manager set in angular.json
 * @param options Option to determine the final package manager
 */
export function getPackageManager(options?: PackageManagerOptions) {
  let packageManagerFromWorkspace: string | undefined;
  if (options?.workspaceConfig) {
    const angularJsonObj = (typeof options?.workspaceConfig === 'string' ? (JSON.parse(options?.workspaceConfig) as WorkspaceSchema) : options?.workspaceConfig);
    if (angularJsonObj?.cli?.packageManager) {
      packageManagerFromWorkspace = angularJsonObj.cli.packageManager;
    }
  }
  const enforcedNpmManager = options?.enforcedNpmManager && isSupportedPackageManager(options.enforcedNpmManager) ? options.enforcedNpmManager : undefined;
  const workspaceNpmManager = isSupportedPackageManager(packageManagerFromWorkspace) ? packageManagerFromWorkspace : undefined;
  return getPackageManagerName(enforcedNpmManager || workspaceNpmManager);
}

/**
 * Get command to run scripts with your package manager
 * @param workspaceConfig Workspace configuration
 * @param packageName Name of the package of the workspace to run the script (name from package.json)
 */
export function getPackageManagerRunner(workspaceConfig?: WorkspaceSchema | string | null, packageName?: string | undefined): string {
  const pckManager = getPackageManager({ workspaceConfig });
  if (!packageName) {
    return `${pckManager} run` as SupportedPackageManagerRunners;
  }
  return `${pckManager} ${PACKAGE_MANAGER_WORKSPACE_MAPPING[pckManager]} ${packageName} run`;
}

/**
 * Get command to execute bin command with your package manager
 * @param workspaceConfig Workspace configuration
 * @param packageName Name of the package of the workspace to execute the command
 */
export function getPackageManagerExecutor(workspaceConfig?: WorkspaceSchema | string | null, packageName?: string | undefined): string {
  const pckManager = getPackageManager({ workspaceConfig });
  if (!packageName) {
    return `${pckManager} exec` as SupportedPackageManagerExecutors;
  }
  return `${pckManager} ${PACKAGE_MANAGER_WORKSPACE_MAPPING[pckManager]} ${packageName} exec`;
}

/**
 * Determine if the given package is installed
 * @param packageName name of the package to check
 * @returns
 */
export function isPackageInstalled(packageName: string) {
  try {
    return !!require.resolve(posix.join(packageName, 'package.json'));
  } catch {
    return false;
  }
}

/**
 * Get package manager version
 * @param options Option to determine the final package manager
 */
export function getPackageManagerVersion(options?: PackageManagerOptions): string | undefined {
  try {
    return execSync(`${getPackageManager(options)} --version`, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      env: {
        ...process.env,
        //  NPM updater notifier will prevents the child process from closing until it timeout after 3 minutes.
        // eslint-disable-next-line @typescript-eslint/naming-convention
        NO_UPDATE_NOTIFIER: '1',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        NPM_CONFIG_UPDATE_NOTIFIER: 'false'
      }
    }).trim();
  } catch {
    return undefined;
  }
}

/**
 * Get package manager information
 * @param options Option to determine the final package manager
 */
export function getPackageManagerInfo(options?: PackageManagerOptions) {
  return {
    name: getPackageManager(options),
    version: getPackageManagerVersion(options)
  };
}
