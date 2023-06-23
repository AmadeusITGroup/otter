import * as commentJson from 'comment-json';
import { WorkspaceSchema } from '../interfaces';

/** Npm packageManager */
export type SupportedPackageManagers = 'npm' | 'yarn';

/**
 * Determine if the given packager manager is supported
 *
 * @param name Name of the package manager
 */
export function isSupportedPackageManager(name?: any): name is SupportedPackageManagers {
  return name === 'yarn' || name === 'npm';
}

/**
 * Get the Package Manager
 *
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
 *
 * @param options.workspaceConfig Workspace configuration
 * @param options.enforcedNpmManager  package manager to enforce, will be used if supported
 * @param options
 */
export function getPackageManager(options?: {workspaceConfig?: WorkspaceSchema | string | null; enforcedNpmManager?: string | null}) {
  let packageManagerFromWorkspace: string | undefined;
  if (options?.workspaceConfig) {
    const angularJsonObj = (typeof options?.workspaceConfig === 'string' ? (commentJson.parse(options?.workspaceConfig) as unknown as WorkspaceSchema) : options?.workspaceConfig);
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
 *
 * @param workspaceConfig Workspace configuration
 */
export function getPackageManagerRunner(workspaceConfig?: WorkspaceSchema | string | null) {
  return getPackageManager({workspaceConfig}) + ' run';
}

/**
 * Get command to execute bin command with your package manager
 *
 * @param workspaceConfig Workspace configuration
 */
export function getPackageManagerExecutor(workspaceConfig?: WorkspaceSchema | string | null) {
  return getPackageManager({workspaceConfig}) + ' exec';
}
