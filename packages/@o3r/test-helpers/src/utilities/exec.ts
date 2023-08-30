import {ExecSyncOptions} from 'node:child_process';

/**
 * Default options to be sent to any exec command inside tests
 */
export function getDefaultExecSyncOptions(): ExecSyncOptions {
  return {
    stdio: 'pipe',
    timeout: 15 * 60 * 1000,
    env: {
      ...process.env,
      /* eslint-disable @typescript-eslint/naming-convention, camelcase */
      JEST_WORKER_ID: undefined,
      NODE_OPTIONS: '',
      CI: 'true',
      npm_execpath: undefined,
      npm_config_user_agent: undefined
      /* eslint-enable @typescript-eslint/naming-convention, camelcase */
    }
  };
}
