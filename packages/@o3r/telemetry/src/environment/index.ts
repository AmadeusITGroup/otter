import * as fs from 'node:fs';
import * as os from 'node:os';
import { execSync } from 'node:child_process';
import * as path from 'node:path';

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

interface PackageManagerInfo {
  /** Name of the package manager used */
  name: SupportedPackageManagers;
  /** Version of the package manager */
  version?: string;
}

/**
 * Get package manager information
 */
function getPackageManagerInfo(): PackageManagerInfo {
  return {
    name: getPackageManager(),
    version: getPackageManagerVersion()
  };
}

/**
 * Operation System information
 */
interface OperatingSystemInfo {
  /** Operating System CPU architecture */
  architecture: string;
  /** Operating System platform */
  platform: string;
  /** Operating System version */
  version: string;
}

/**
 * NodeJS information
 */
interface NodeInfo {
  /** Version of NodeJS */
  version: string;
}

/**
 * Otter information
 */
interface OtterInfo {
  /** Version of `@o3r/core` or `@o3r/telemetry` */
  version?: string;
}

/**
 * Project information
 */
interface ProjectInfo {
  /** Name of the project */
  name: string;
}

export interface EnvironmentMetricData {
  /** OS information */
  os: OperatingSystemInfo;
  /** NodeJS information */
  node: NodeInfo;
  /** Package manager information */
  packageManager: PackageManagerInfo;
  /** Otter information */
  otter: OtterInfo;
  /** Is process run in a CI */
  ci: boolean;
  /** Project information */
  project?: ProjectInfo;
}

/**
 * Get all environment information
 * Could be useful for debugging issue
 */
export const getEnvironmentInfo = async (): Promise<EnvironmentMetricData> => {
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
    // Fallback to the @o3r/telemetry package version if @o3r/core is not found
    otterCorePackageJsonPath = path.join(__dirname, '..', '..', 'package.json');
  }
  const otterInfo = {
    version: otterCorePackageJsonPath ? JSON.parse(await fs.promises.readFile(otterCorePackageJsonPath, { encoding: 'utf-8' })).version as string : undefined
  };

  const ci = typeof process.env.CI !== undefined && process.env.CI?.toLowerCase() !== 'false';

  let projectName: string | undefined;
  try {
    projectName = JSON.parse(await fs.promises.readFile(path.join(process.cwd(), 'package.json'), { encoding: 'utf-8' })).name;
  } catch {}

  return {
    os: osInfo,
    node: nodeInfo,
    packageManager: packageManagerInfo,
    otter: otterInfo,
    ci,
    ...(projectName ? { project: { name: projectName } } : {})
  };
};

/**
 * Stringify the result of `getEnvironmentInfo`
 * @see getEnvironmentInfo
 */
export const getEnvironmentInfoStringify = async () => {
  const { os: osInfo, node: nodeInfo, packageManager: packageManagerInfo, otter: otterInfo, ci } = await getEnvironmentInfo();
  return `
- User Agent Architecture: ${osInfo.architecture}
- User Agent Platform: ${osInfo.platform}
- User Agent Version: ${osInfo.version}
- Node Version: ${nodeInfo.version || 'undefined'}
- Package Manager Name: ${packageManagerInfo.name}
- Package Manager Version: ${packageManagerInfo.version || 'undefined'}
- Otter Version: ${otterInfo.version || 'undefined'}
- CI: ${ci}
`;
};
