import * as fs from 'node:fs';
import * as os from 'node:os';
import { execSync } from 'node:child_process';

/** Support NPM package managers */
type SupportedPackageManagers = 'npm' | 'yarn';

/**
 * Determine if the given packager manager is supported
 * @param name Name of the package manager
 */
function isSupportedPackageManager(name?: any): name is SupportedPackageManagers {
  return name === 'yarn' || name === 'npm';
}

/**
 * Get package manager used
 */
function getPackageManager() {
  if (isSupportedPackageManager(process.env?.ENFORCED_PACKAGE_MANAGER)) {
    return process.env.ENFORCED_PACKAGE_MANAGER;
  }
  return (process.env?.npm_execpath?.includes('yarn') && 'yarn') || 'npm';
}

/**
 * Get package manager version
 */
function getPackageManagerVersion(): string | undefined {
  try {
    return execSync(`${getPackageManager()} --version`, {
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
 */
function getPackageManagerInfo() {
  return {
    name: getPackageManager(),
    version: getPackageManagerVersion()
  };
}

/**
 * Get all environment information
 * Could be useful for debugging issue
 */
export const getEnvironmentInfo = () => {
  const osInfo = {
    architecture: os.arch(),
    platform: os.platform(),
    version: os.release()
  };
  const nodeInfo = {
    version: process.version
  };
  const packageManagerInfo = getPackageManagerInfo();
  let otterCorePackageJsonPath: string | undefined;
  try {
    otterCorePackageJsonPath = require.resolve('@o3r/core/package.json');
  } catch {
    // Do not throw error if @o3r/core is not found
  }
  const otterInfo = {
    version: otterCorePackageJsonPath ? JSON.parse(fs.readFileSync(otterCorePackageJsonPath, { encoding: 'utf-8' })).version as string : undefined
  };
  return { os: osInfo, node: nodeInfo, packageManager: packageManagerInfo, otter: otterInfo };
};

/**
 * Stringify the result of `getEnvironmentInfo`
 * @see getEnvironmentInfo
 */
export const getEnvironmentInfoStringify = () => {
  const { os: osInfo, node: nodeInfo, packageManager: packageManagerInfo, otter: otterInfo } = getEnvironmentInfo();
  return `
- User Agent Architecture: ${osInfo.architecture}
- User Agent Platform: ${osInfo.platform}
- User Agent Version: ${osInfo.version}
- Node Version: ${nodeInfo.version || 'undefined'}
- Package Manager Name: ${packageManagerInfo.name}
- Package Manager Version: ${packageManagerInfo.version || 'undefined'}
- Otter Version: ${otterInfo.version || 'undefined'}
`;
};
