import { ExecSyncOptions } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import * as path from 'node:path';
import {
  createWithLock,
  CreateWithLockOptions,
  getPackageManager,
  type Logger,
  PackageManagerConfig,
  packageManagerCreate,
  packageManagerExec,
  packageManagerInstall,
  setPackagerManagerConfig
} from '../utilities';

export interface CreateTestEnvironmentOtterProjectWithAppOptions extends CreateWithLockOptions, PackageManagerConfig {
  /**
   * Name of the app to generate
   */
  projectName: string;

  /**
   * Working directory
   */
  cwd: string;

  /**
   * Otter dependency version
   * @default '999.0.0'
   */
  o3rVersion: string;

  /** Logger to use for logging */
  logger?: Logger;
}

const o3rVersion = '~999';

/**
 * Generate a base angular app with minimal necessary dependencies
 * Uses a locker mechanism so this function can be called in parallel
 * The lock will automatically expire after 10 minutes if the creation of the app failed for whatever reason
 * @param inputOptions
 */
export async function createTestEnvironmentOtterProjectWithApp(inputOptions: Partial<CreateTestEnvironmentOtterProjectWithAppOptions>) {
  const options: CreateTestEnvironmentOtterProjectWithAppOptions = {
    projectName: 'test-app',
    appDirectory: 'test-app',
    o3rVersion,
    cwd: process.cwd(),
    globalFolderPath: process.cwd(),
    registry: 'http://127.0.0.1:4873',
    lockTimeout: 10 * 60 * 1000,
    replaceExisting: true,
    ...inputOptions
  };

  await createWithLock(() => {
    const appFolderPath = path.join(options.cwd, options.appDirectory);
    const execAppOptions: ExecSyncOptions = {
      cwd: appFolderPath,
      stdio: 'inherit',
      // eslint-disable-next-line @typescript-eslint/naming-convention
      env: { ...process.env, NODE_OPTIONS: '', CI: 'true' }
    };

    // Prepare folder
    if (existsSync(appFolderPath)) {
      rmSync(appFolderPath, { recursive: true });
    }

    // prepare package manager config
    setPackagerManagerConfig(options, { ...execAppOptions, cwd: options.cwd }, 'npm');
    try { mkdirSync(appFolderPath, { recursive: true }); } catch { }
    setPackagerManagerConfig(options, execAppOptions);

    // Create Project
    const createOptions = ['--package-manager', getPackageManager(), '--skip-confirmation', ...(options.yarnVersion ? ['--yarn-version', options.yarnVersion] : [])];
    packageManagerCreate({ script: `@o3r@${o3rVersion}`, args: [options.appDirectory, ...createOptions] }, { ...execAppOptions, cwd: options.cwd}, 'npm');
    const gitIgnorePath = path.join(appFolderPath, '.gitignore');
    if (existsSync(gitIgnorePath)) {
      const gitIgnore = readFileSync(gitIgnorePath, { encoding: 'utf8' });
      writeFileSync(gitIgnorePath, gitIgnore.replace(/\/(dist|node_modules)/g, '$1'));
    }
    packageManagerInstall(execAppOptions);
    packageManagerExec({script: 'ng', args: ['g', 'application', 'dont-modify-me']}, execAppOptions);
    packageManagerExec({script: 'ng', args: ['g', 'application', options.projectName]}, execAppOptions);


    packageManagerExec({script: 'ng', args: ['config', 'cli.cache.environment', 'all']}, execAppOptions);
    if (options.globalFolderPath) {
      packageManagerExec({script: 'ng', args: ['config', 'cli.cache.path', path.join(options.globalFolderPath, '.angular', 'cache')]}, execAppOptions);
    }

    return Promise.resolve();
  }, { lockFilePath: path.join(options.cwd, `${options.appDirectory}-ongoing.lock`), ...options });
}
