import {
  ExecSyncOptions,
} from 'node:child_process';
import {
  getPackageManager,
} from './package-manager';

/**
 * Environment override preventing `UNRS_RESOLVER_YARN_PNP` (set by unrs-resolver, used by jest 30.5+, under Yarn PnP)
 * from leaking to the tested projects when they are not using Yarn
 */
export function getUnrsResolverEnvOverride(): Record<string, undefined> {
  return getPackageManager() === 'yarn' ? {} : { UNRS_RESOLVER_YARN_PNP: undefined };
}

/**
 * Default options to be sent to any exec command inside tests
 */
export function getDefaultExecSyncOptions(): ExecSyncOptions {
  return {
    stdio: 'pipe',
    timeout: 15 * 60 * 1000,
    env: {
      ...process.env,
      JEST_WORKER_ID: undefined,
      NODE_OPTIONS: '',
      CI: 'true',
      npm_execpath: undefined,
      npm_config_user_agent: undefined,
      ...getUnrsResolverEnvOverride()
    }
  };
}
