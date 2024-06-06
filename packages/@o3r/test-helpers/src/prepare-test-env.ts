import { execFileSync, ExecSyncOptions } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync } from 'node:fs';
import * as path from 'node:path';
import type { PackageJson } from 'type-fest';
import { createTestEnvironmentBlank } from './test-environments/create-test-environment-blank';
import { createWithLock, getPackageManager, type Logger, packageManagerInstall, setPackagerManagerConfig, setupGit } from './utilities/index';
import { createTestEnvironmentOtterProjectWithApp } from './test-environments/create-test-environment-otter-project';
import { O3rCliError } from '@o3r/schematics';

/**
 * - 'blank' only create yarn/npm config
 * - 'o3r-project-with-app' create a new otter project with a new application
 */
export type PrepareTestEnvType = 'blank' | 'o3r-project-with-app';

/**
 * Retrieve the version used by yarn and setup at root level
 * @param rootFolderPath: path to the folder where to take the configuration from
 * @param rootFolderPath
 */
export function getYarnVersionFromRoot(rootFolderPath: string) {
  const o3rPackageJson: PackageJson & { generatorDependencies?: Record<string, string> } =
    JSON.parse(readFileSync(path.join(rootFolderPath, 'package.json')).toString());
  return o3rPackageJson?.packageManager?.split('@')?.[1] || 'latest';
}

export interface PrepareTestEnvOptions {
  /** Type of environment to prepare */
  type?: PrepareTestEnvType;
  /** Explicitly set the yarn version for yarn environment. Else it will default to the folder package.json */
  yarnVersion?: string;
  /** Logger to use for logging */
  logger?: Logger;
}

/**
 * Prepare a test environment to be used to run tests targeting a local registry
 * @param folderName
 * @param options
 */
export async function prepareTestEnv(folderName: string, options?: PrepareTestEnvOptions) {
  const type = options?.type || process.env.PREPARE_TEST_ENV_TYPE || 'o3r-project-with-app';
  const logger = options?.logger || console;
  const yarnVersionParam = options?.yarnVersion;
  const rootFolderPath = process.cwd();
  const itTestsFolderPath = path.resolve(rootFolderPath, '..', 'it-tests');
  const workspacePath = path.resolve(itTestsFolderPath, folderName);
  const globalFolderPath = path.resolve(rootFolderPath, '.cache', 'test-app');
  const o3rVersion = '~999';
  const registry = 'http://127.0.0.1:4873';

  JSON.parse(readFileSync(path.join(rootFolderPath, 'packages', '@o3r', 'core', 'package.json')).toString());
  const yarnVersion: string = yarnVersionParam || getYarnVersionFromRoot(rootFolderPath);
  const execAppOptions: ExecSyncOptions = {
    cwd: workspacePath,
    stdio: 'inherit',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    env: {...process.env, NODE_OPTIONS: '', CI: 'true'}
  };

  const packageManagerConfig = {
    yarnVersion,
    globalFolderPath,
    registry
  };

  // Create it-tests folder
  if (!existsSync(itTestsFolderPath)) {
    logger.debug?.(`Creating it-tests folder`);
    await createWithLock(() => {
      mkdirSync(itTestsFolderPath);
      setPackagerManagerConfig(packageManagerConfig, {...execAppOptions, cwd: itTestsFolderPath});
      return Promise.resolve();
    }, {lockFilePath: `${itTestsFolderPath}.lock`, cwd: path.join(rootFolderPath, '..'), appDirectory: 'it-tests'});
  }
  const o3rExactVersion = execFileSync('npm', ['info', '@o3r/create', 'version'], {
    ...execAppOptions,
    cwd: itTestsFolderPath,
    stdio: 'pipe',
    encoding: 'utf8',
    shell: true
  }).replace(/\s/g, '');

  // Remove existing app
  if (existsSync(workspacePath)) {
    rmSync(workspacePath, {recursive: true});
  }

  const prepareFinalApp = (baseApp: string) => {
    logger.debug?.(`Copying ${baseApp} to ${workspacePath}`);
    const baseProjectPath = path.join(itTestsFolderPath, baseApp);
    execFileSync('git', ['clone', baseProjectPath, workspacePath, '--no-tags']);
    if (existsSync(path.join(workspacePath, 'package.json'))) {
      packageManagerInstall(execAppOptions);
    }
  };

  let projectPath = workspacePath;
  let projectName = '';
  let isInWorkspace = false;
  let untouchedProject: undefined | string;
  let untouchedProjectPath: undefined | string;
  const appDirectory = `${type}-${getPackageManager()}`;
  switch (type) {
    case 'blank': {
      await createTestEnvironmentBlank({
        appDirectory,
        cwd: itTestsFolderPath,
        logger,
        ...packageManagerConfig
      });
      projectPath = workspacePath;
      break;
    }

    case 'o3r-project-with-app': {
      projectName = 'test-app';
      untouchedProject = 'dont-modify-me';
      await createTestEnvironmentOtterProjectWithApp({
        projectName,
        appDirectory,
        cwd: itTestsFolderPath,
        o3rVersion,
        logger,
        ...packageManagerConfig,
        replaceExisting: !process.env.CI
      });
      projectPath = path.resolve(workspacePath, 'apps', projectName);
      untouchedProjectPath = path.resolve(workspacePath, 'apps', untouchedProject);
      isInWorkspace = true;
      break;
    }

    default: {
      throw new O3rCliError(`Unknown test environment type: ${type}`);
    }
  }

  prepareFinalApp(appDirectory);

  // Setup git and initial commit to easily make checks on the diff inside the tests
  setupGit(workspacePath);

  return {
    workspacePath,
    projectPath,
    projectName,
    isInWorkspace,
    untouchedProject,
    untouchedProjectPath,
    packageManagerConfig,
    o3rVersion,
    o3rExactVersion,
    registry
  };
}
