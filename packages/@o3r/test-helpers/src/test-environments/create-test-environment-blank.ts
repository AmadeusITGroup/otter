import { ExecSyncOptions } from 'node:child_process';
import { existsSync, mkdirSync, rmSync } from 'node:fs';
import * as path from 'node:path';
import { PackageManagerConfig, setPackagerManagerConfig } from '../utilities';

export interface CreateTestEnvironmentBlankOptions extends PackageManagerConfig {
  /**
   * Directory used to generate app
   */
  appDirectory: string;

  /**
   * Working directory
   */
  cwd: string;
}

/**
 * Generate a folder with minimal config for package manager to target local packages with Verdaccio
 * @param inputOptions
 */
export function createTestEnvironmentBlank(inputOptions: Partial<CreateTestEnvironmentBlankOptions>) {
  const options: CreateTestEnvironmentBlankOptions = {
    appDirectory: 'test-app',
    cwd: process.cwd(),
    globalFolderPath: process.cwd(),
    registry: 'http://127.0.0.1:4873',
    ...inputOptions
  };
  const appFolderPath = path.join(options.cwd, options.appDirectory);
  if (existsSync(appFolderPath)) {
    return;
  }

  const execAppOptions: ExecSyncOptions = {
    cwd: appFolderPath,
    stdio: 'inherit',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    env: {...process.env, NODE_OPTIONS: '', CI: 'true'}
  };

  // Prepare folder
  if (existsSync(appFolderPath)) {
    rmSync(appFolderPath, {recursive: true});
  }

  mkdirSync(appFolderPath, {recursive: true});

  setPackagerManagerConfig(options, execAppOptions);
}
