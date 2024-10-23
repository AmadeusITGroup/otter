import {
  spawn,
  SpawnOptionsWithoutStdio
} from 'node:child_process';
import type * as logger from 'loglevel';

/** Option to PromiseSpawn helper */
export interface SpawnOptions extends SpawnOptionsWithoutStdio {
  /** Logger function to log stdout messages */
  stdoutLogger: typeof logger.debug;
  /** Logger function to log stderr messages */
  stderrLogger: typeof logger.error;
  /** Default logger instance */
  logger?: logger.Logger;
}

/**
 * Spawn a child process command and return a promise end finished
 * @param command command to execute
 * @param opt options to spawn function
 */
export const promiseSpawn = (command: string, opt?: Partial<SpawnOptions>) => {
  const options: SpawnOptions = {
    cwd: process.cwd(),
    // eslint-disable-next-line no-console -- console is here as default value
    stdoutLogger: (...args: any[]) => (opt?.logger?.debug || console.debug)(...args),
    // eslint-disable-next-line no-console -- console is here as default value
    stderrLogger: (...args: any[]) => (opt?.logger?.error || console.error)(...args),
    env: process.env,
    shell: true,
    stdio: [undefined, 'pipe', 'pipe'],
    ...opt
  };

  options.logger?.debug(`run ${command} (in ${options.cwd!.toString()})`);
  const cmd = spawn(command, options);

  if (options.stdoutLogger) {
    cmd.stdout.on('data', (message) => options.stdoutLogger(message.toString()));
  }
  if (options.stderrLogger) {
    cmd.stderr.on('data', (message) => options.stderrLogger(message.toString()));
  }
  return new Promise<void>((resolve, reject) => {
    cmd.once('error', (err) => reject(err));
    cmd.once('close', (status) => status === 0 ? resolve() : reject(new Error(`status: ${status || 'null'}`)));
  });
};
