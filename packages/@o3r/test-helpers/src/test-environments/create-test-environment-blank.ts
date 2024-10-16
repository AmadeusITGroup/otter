import { ExecSyncOptions } from 'node:child_process';
import { existsSync, promises as fs } from 'node:fs';
import * as path from 'node:path';
import { createWithLock, type CreateWithLockOptions, type Logger, PackageManagerConfig, setPackagerManagerConfig } from '../utilities';

export interface CreateTestEnvironmentBlankOptions extends CreateWithLockOptions, PackageManagerConfig {
  /**
   * Directory used to generate app
   */
  appDirectory: string;

  /**
   * Working directory
   */
  cwd: string;


  /** Logger to use for logging */
  logger?: Logger;
}

/**
 * Generate a folder with minimal config for package manager to target local packages with Verdaccio
 * @param inputOptions
 */
export async function createTestEnvironmentBlank(inputOptions: Partial<CreateTestEnvironmentBlankOptions>) {
  const options: CreateTestEnvironmentBlankOptions = {
    appDirectory: 'test-app',
    cwd: process.cwd(),
    globalFolderPath: process.cwd(),
    registry: 'http://127.0.0.1:4873',
    lockTimeout: 10 * 60 * 1000,
    replaceExisting: true,
    ...inputOptions
  };
  await createWithLock(async () => {
    const appFolderPath = path.join(options.cwd, options.appDirectory);
    const execAppOptions: ExecSyncOptions = {
      cwd: appFolderPath,
      stdio: 'inherit',
      // eslint-disable-next-line @typescript-eslint/naming-convention
      env: {...process.env, NODE_OPTIONS: '', CI: 'true'}
    };

    // Prepare folder
    if (existsSync(appFolderPath)) {
      await fs.rm(appFolderPath, {recursive: true});
    }

    await fs.mkdir(appFolderPath, {recursive: true});

    setPackagerManagerConfig(options, { ...execAppOptions, cwd: options.cwd });
    setPackagerManagerConfig(options, execAppOptions);

    // some yarn versions generate a package.json that need to be removed to avoid polluting the test workspace
    if (existsSync(path.join(appFolderPath, 'package.json'))) {
      await fs.rm(path.join(appFolderPath, 'package.json'));
    }
    if (existsSync(path.join(appFolderPath, 'yarn.lock'))) {
      await fs.rm(path.join(appFolderPath, 'yarn.lock'));
    }

  }, { lockFilePath: path.join(options.cwd, `${options.appDirectory}-ongoing.lock`), ...options });
}
