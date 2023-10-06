import * as fs from 'node:fs';
import * as os from 'node:os';
import * as semver from 'semver';
import { getPackageManagerInfo } from './package-manager-runner';

/**
 * Get all environment information
 * Could be useful for debugging issue
 */
export const getEnvironmentInfo = () => {
  const nodeVersion = semver.parse(process.version);
  const osInfo = {
    architecture: os.arch(),
    platform: os.platform(),
    version: os.release()
  };
  const nodeInfo = {
    version: nodeVersion && `${nodeVersion.major}.${nodeVersion.minor}.${nodeVersion.patch}`
  };
  const packageManagerInfo = getPackageManagerInfo();
  let otterCorePackageJsonPath: string | undefined;
  try {
    otterCorePackageJsonPath = require.resolve('@o3r/core/package.json');
  } catch {}
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
