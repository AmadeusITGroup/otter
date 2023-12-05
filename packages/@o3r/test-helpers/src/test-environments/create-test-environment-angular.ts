import { execFileSync, ExecSyncOptions } from 'node:child_process';
import { cpSync, existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import * as path from 'node:path';
import {
  createWithLock,
  CreateWithLockOptions,
  fixAngularVersion,
  getPackageManager,
  packageManagerAdd,
  PackageManagerConfig,
  packageManagerExec,
  packageManagerInstall,
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
      rmSync(appFolderPath, {recursive: true});
    }

    // Create angular app
    if (options.generateMonorepo) {
      const createOptions = `--directory=${options.appDirectory} --no-create-application --skip-git --skip-install --package-manager=${getPackageManager()}`;
      execFileSync('npm', `create @angular${options.angularVersion ? `@${options.angularVersion}` : ''} ${options.appName} -- ${createOptions}`.split(' '),
        // eslint-disable-next-line @typescript-eslint/naming-convention
        {...execAppOptions, cwd: options.cwd, shell: process.platform === 'win32'});
      // By default node_modules inside projects are not git-ignored
      const gitIgnorePath = path.join(appFolderPath, '.gitignore');
      if (existsSync(gitIgnorePath)) {
        const gitIgnore = readFileSync(gitIgnorePath, {encoding: 'utf8'});
        writeFileSync(gitIgnorePath, gitIgnore.replace(/\/(dist|node_modules)/g, '$1'));
      }
      await fixAngularVersion(appFolderPath);
      setPackagerManagerConfig(options, execAppOptions);
      packageManagerInstall(execAppOptions);
      packageManagerExec('ng g application dont-modify-me --style=scss --routing --skip-install', execAppOptions);
      packageManagerExec(`ng g application ${options.appName} --style=scss --routing --skip-install`, execAppOptions);
    } else {
      const createOptions = `--directory=${options.appDirectory} --style=scss --routing --skip-git --skip-install --package-manager=${getPackageManager()}`;
      execFileSync('npm', `create @angular${options.angularVersion ? `@${options.angularVersion}` : ''} ${options.appName} -- ${createOptions}`.split(' '),
        // eslint-disable-next-line @typescript-eslint/naming-convention
        {...execAppOptions, cwd: options.cwd, shell: process.platform === 'win32'});
      await fixAngularVersion(appFolderPath);
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
      `${Object.entries(dependenciesToInstall).map(([depName, version]) => `${depName}${version ? `@~${version}` : ''}`).join(' ')}`,
      execAppOptions
    );

    // Run ng-adds
    const project = options.generateMonorepo ? '--project=test-app' : '';
    packageManagerExec(`ng add @angular/pwa ${project}`, execAppOptions);
    packageManagerExec(`ng add @angular/material ${project}`, execAppOptions);

    if (options.generateMonorepo) {
      // TODO remove this when https://github.com/AmadeusITGroup/otter/issues/603 has been resolved
      const workspacePackageJsonPath = path.join(appFolderPath, 'package.json');
      const packageJsonString = readFileSync(workspacePackageJsonPath, {encoding: 'utf8'});
      const packageJson = JSON.parse(packageJsonString);
      writeFileSync(workspacePackageJsonPath, JSON.stringify({
        ...packageJson,
        scripts: {...packageJson.scripts, build: getPackageManager() === 'npm' ? 'npm run build --workspaces' : 'yarn workspaces foreach -A run build'},
        workspaces: ['projects/*']
      }, null, 2));
      writeFileSync(path.join(appFolderPath, 'projects', 'test-app', 'package.json'), packageJsonString.replace(/"test-app"/, '"test-app-project"'));
      writeFileSync(path.join(appFolderPath, 'projects', 'dont-modify-me', 'package.json'), packageJsonString.replace(/"test-app"/, '"dont-modify-me"'));

      // TODO remove this if we manage to make 'workspace <> ng add' work with private registry
      cpSync(path.join(appFolderPath, '.npmrc'), path.join(appFolderPath, 'projects', 'test-app', '.npmrc'));

      if (getPackageManager() === 'yarn' && options.yarnVersion && Number.parseInt(options.yarnVersion.split('.')[0], 10) < 4) {
        execFileSync('yarn', ['plugin', 'import', 'workspace-tools'], {...execAppOptions, shell: process.platform === 'win32'});
      }
    }

    packageManagerInstall(execAppOptions);
  }, {lockFilePath: path.join(options.cwd, `${options.appDirectory}-ongoing.lock`), ...options, dependenciesToCheck});
}
