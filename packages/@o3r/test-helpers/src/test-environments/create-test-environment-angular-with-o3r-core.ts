import { ExecSyncOptions } from 'node:child_process';
import { cpSync, existsSync } from 'node:fs';
import path from 'node:path';
import { createTestEnvironmentAngular, CreateTestEnvironmentAngularOptions } from './create-test-environment-angular';
import { createWithLock, packageManagerAdd, packageManagerExec, packageManagerInstall } from '../utilities';

export interface CreateTestEnvironmentAngularWithO3rCoreOptions extends CreateTestEnvironmentAngularOptions {
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

  /**
   * Angular app to copy to avoid recreating everything
   */
  baseAngularAppPath?: string;
}

/**
 * Generate a base angular app with minimal necessary dependencies and @o3r/core installed with basic preset
 * Uses a locker mechanism so this function can be called in parallel
 * The lock will automatically expire after 10 minutes if the creation of the app failed for whatever reason
 * @param inputOptions
 */
export async function createTestEnvironmentAngularWithO3rCore(inputOptions: Partial<CreateTestEnvironmentAngularWithO3rCoreOptions>) {
  const options: CreateTestEnvironmentAngularWithO3rCoreOptions = {
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
  await createWithLock(async () => {
    const appFolderPath = path.join(options.cwd, options.appDirectory);
    const execAppOptions: ExecSyncOptions = {
      cwd: appFolderPath,
      stdio: 'inherit',
      // eslint-disable-next-line @typescript-eslint/naming-convention
      env: {...process.env, NODE_OPTIONS: '', CI: 'true'}
    };
    if (options.baseAngularAppPath && existsSync(options.baseAngularAppPath)) {
      cpSync(options.baseAngularAppPath, appFolderPath, {recursive: true, dereference: true, filter: (source) => !/node_modules/.test(source)});
      packageManagerInstall(execAppOptions);
    } else {
      await createTestEnvironmentAngular({...options, useLocker: false});
    }
    const o3rVersion = '999.0.0';
    if (options.generateMonorepo) {
      packageManagerExec(`ng add --skip-confirmation @o3r/core@${o3rVersion} --skip-git`, execAppOptions);
      // FIXME: workaround for yarn pnp (same issue with node_modules but the runner won't complain if package is present in root instead of project)
      packageManagerAdd(`@o3r/core@${o3rVersion}`, {...execAppOptions, cwd: path.join(appFolderPath, 'projects', 'test-app')});
      packageManagerExec(`ng add --skip-confirmation @o3r/core@${o3rVersion} --project-name=test-app --skip-git`, execAppOptions);
    } else {
      packageManagerExec(`ng add --skip-confirmation @o3r/core@${o3rVersion} --skip-git`, execAppOptions);
    }

    packageManagerInstall(execAppOptions);
  }, {lockFilePath: path.join(options.cwd, `${options.appDirectory}-ongoing.lock`), ...options, dependenciesToCheck});
}
