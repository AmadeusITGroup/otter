import { ExecSyncOptions } from 'node:child_process';
import { existsSync, rmSync } from 'node:fs';
import * as path from 'node:path';
import {
  createWithLock,
  CreateWithLockOptions,
  getPackageManager,
  packageManagerAdd,
  PackageManagerConfig,
  packageManagerCreate,
  packageManagerExec,
  packageManagerInstall,
  packageManagerRun,
  setPackagerManagerConfig
} from '../utilities';

export interface CreateTestEnvironmentAngularOptions extends CreateWithLockOptions, PackageManagerConfig {
  /**
   * Name of the app to generate
   */
  appName: string;

  /**
   * Directory used to generate app
   */
  appDirectory: string;

  /**
   * Working directory
   */
  cwd: string;

  /**
   * Generate the app inside a monorepo
   */
  generateMonorepo?: boolean;

  /**
   * Version of Angular to install
   */
  angularVersion?: string;

  /**
   * Version of Angular Material to install
   */
  materialVersion?: string;
}

/**
 * Generate a base angular app with minimal necessary dependencies
 * Uses a locker mechanism so this function can be called in parallel
 * The lock will automatically expire after 10 minutes if the creation of the app failed for whatever reason
 * @param inputOptions
 */
export async function createTestEnvironmentAngular(inputOptions: Partial<CreateTestEnvironmentAngularOptions>) {
  const options: CreateTestEnvironmentAngularOptions = {
    appName: 'test-app',
    appDirectory: 'test-app',
    cwd: process.cwd(),
    generateMonorepo: false,
    globalFolderPath: process.cwd(),
    registry: 'http://127.0.0.1:4873',
    useLocker: true,
    lockTimeout: 10 * 60 * 1000,
    replaceExisting: true,
    ...inputOptions
  };
  const dependenciesToCheck = [
    {name: '@angular-devkit/schematics', expected: options.angularVersion},
    {name: '@angular/material', expected: options.materialVersion}
  ];
  await createWithLock(() => {
    const appFolderPath = path.join(options.cwd, options.appDirectory);
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

    // Create angular app
    if (options.generateMonorepo) {
      const createOptions = `--directory=${options.appDirectory} --no-create-application --skip-git --package-manager=${getPackageManager()}`;
      packageManagerCreate(`@angular@${options.angularVersion || 'latest'} ${options.appName} ${createOptions}`,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        {...execAppOptions, cwd: options.cwd});
      setPackagerManagerConfig(options, execAppOptions);
      packageManagerInstall(execAppOptions);
      packageManagerExec(`ng g application ${options.appName} --style=scss --routing`, execAppOptions);
    } else {
      const createOptions = `--directory=${options.appDirectory} --style=scss --routing --skip-git --package-manager=${getPackageManager()}`;
      packageManagerCreate(`@angular@${options.angularVersion || 'latest'} ${options.appName} ${createOptions}`,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        {...execAppOptions, cwd: options.cwd});
      setPackagerManagerConfig(options, execAppOptions);
      packageManagerInstall(execAppOptions);
    }
    packageManagerExec('ng config cli.cache.environment all', execAppOptions);
    if (options.globalFolderPath) {
      packageManagerExec(`ng config cli.cache.path "${path.join(options.globalFolderPath, '.angular', 'cache')}"`, execAppOptions);
    }

    // Add dependencies
    const dependenciesToInstall = {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      '@angular-devkit/schematics': options.angularVersion,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      '@angular/pwa': options.angularVersion,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      '@angular/material': options.materialVersion,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      '@angular-devkit/core': options.angularVersion,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      '@schematics/angular': options.angularVersion
    };
    packageManagerAdd(
      `${Object.entries(dependenciesToInstall).map(([depName, version]) => `${depName}@${version || 'latest'}`).join(' ')}`,
      execAppOptions
    );

    // Run ng-adds
    packageManagerExec('ng add @angular/pwa', execAppOptions);
    packageManagerExec('ng add @angular/material', execAppOptions);

    packageManagerInstall(execAppOptions);
    packageManagerRun('build', execAppOptions);

    return Promise.resolve();
  }, {lockFilePath: path.join(options.cwd, `${options.appDirectory}-ongoing.lock`), ...options, dependenciesToCheck});
}
