import { execSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import * as path from 'node:path';
import type { PackageJson } from 'type-fest';
import { minVersion } from 'semver';
import { createTestEnvironmentAngular } from './test-environments/create-test-environment-angular';
import { createTestEnvironmentAngularWithO3rCore } from './test-environments/create-test-environment-angular-with-o3r-core';
import { createTestEnvironmentBlank } from './test-environments/create-test-environment-blank';

/**
 * 'blank' only create yarn/npm config
 * 'angular' also create a new angular app
 * 'angular-with-o3r-core' also preinstall o3r-core with basic preset
 * 'angular-monorepo' is the same as 'angular' but with a monorepo structure
 * 'angular-monorepo-with-o3r-core' is the same as 'angular-with-o3r-core' but with a monorepo structure
 */
export type PrepareTestEnvType = 'blank' | 'angular' | 'angular-with-o3r-core' | 'angular-monorepo' | 'angular-monorepo-with-o3r-core';

/**
 * Prepare a test environment to be used to run tests targeting a local registry
 * Test app created for 'angular' and 'angular-with-o3r-core' are reused when called multiple times
 * @param folderName name of the folder where the environment will be generated
 * @param type type of environment to prepare
 */
export async function prepareTestEnv(folderName: string, type: PrepareTestEnvType) {
  const rootFolderPath = process.cwd();
  const itTestsFolderPath = path.join(rootFolderPath, '..', 'it-tests');
  const baseAngularAppFolderPath = path.join(itTestsFolderPath, 'base-app-angular');
  const baseAngularAppWithCoreFolderPath = path.join(itTestsFolderPath, 'base-app-angular-with-o3r-core');
  const appFolderPath = path.join(itTestsFolderPath, folderName);
  const globalFolderPath = path.join(rootFolderPath, '.cache', 'test-app');
  const cacheFolderPath = path.join(globalFolderPath, 'cache');

  const o3rCorePackageJson: PackageJson & { generatorDependencies?: Record<string, string> } =
    JSON.parse(readFileSync(path.join(rootFolderPath, 'packages', '@o3r', 'core', 'package.json')).toString());
  const o3rPackageJson: PackageJson & { generatorDependencies?: Record<string, string> } =
    JSON.parse(readFileSync(path.join(rootFolderPath, 'package.json')).toString());
  const yarnVersion: string = o3rPackageJson?.packageManager?.split('@')?.[1] || '3.5.0';
  const angularVersion = minVersion(o3rCorePackageJson.devDependencies?.['@angular-devkit/schematics'] || 'latest')?.version;
  const materialVersion = minVersion(o3rCorePackageJson.generatorDependencies?.['@angular/material'] || angularVersion || 'latest')?.version;

  // Remove all cache entries relative to local workspaces (@o3r, @ama-sdk, @ama-terasu)
  if (!process.env.CI && existsSync(cacheFolderPath)) {
    const workspacesList = execSync('yarn workspaces:list', {stdio: 'pipe'}).toString().split('\n')
      .map((workspace) => workspace.replace('packages/', '').replace(/\//, '-'))
      .filter((workspace) => !!workspace);
    readdirSync(cacheFolderPath).forEach((fileName) => {
      if (workspacesList.some((workspace) => fileName.startsWith(workspace))) {
        const cacheFile = path.join(cacheFolderPath, fileName);
        // Not ideal solution but the tests are running in parallel, so we cannot always clean the cache
        if (Date.now() - statSync(cacheFile).birthtime.getTime() > (60 * 60 * 1000)) {
          rmSync(cacheFile);
        }
      }
    });
  }

  // Create it-tests folder
  if (!existsSync(itTestsFolderPath)) {
    mkdirSync(itTestsFolderPath);
  }

  // Remove existing app
  if (existsSync(appFolderPath)) {
    rmSync(appFolderPath, {recursive: true});
  }

  if (type === 'blank') {
    createTestEnvironmentBlank({
      appDirectory: folderName,
      cwd: itTestsFolderPath,
      globalFolderPath,
      yarnVersion
    });
  } else {
    const generateMonorepo = type === 'angular-monorepo' || type === 'angular-monorepo-with-o3r-core';

    // Create new base app if needed
    await createTestEnvironmentAngular({
      appName: 'test-app',
      appDirectory: `base-app-angular${generateMonorepo ? '-monorepo' : ''}`,
      cwd: itTestsFolderPath,
      globalFolderPath,
      yarnVersion,
      angularVersion,
      materialVersion,
      replaceExisting: !process.env.CI,
      generateMonorepo
    });

    if (type === 'angular-with-o3r-core' || type === 'angular-monorepo-with-o3r-core') {
      // Create new base app if needed
      await createTestEnvironmentAngularWithO3rCore({
        appName: 'test-app',
        appDirectory: `base-app-angular${generateMonorepo ? '-monorepo' : ''}-with-o3r-core`,
        cwd: itTestsFolderPath,
        globalFolderPath,
        yarnVersion,
        angularVersion,
        materialVersion,
        baseAngularAppPath: path.join(itTestsFolderPath, `base-app-angular${generateMonorepo ? '-monorepo' : ''}`),
        replaceExisting: !process.env.CI,
        generateMonorepo
      });
    }
  }

  // Copy base app into test app
  if (type !== 'blank') {
    cpSync(type === 'angular-with-o3r-core' ? baseAngularAppWithCoreFolderPath : baseAngularAppFolderPath, appFolderPath, {recursive: true});
  }

  return appFolderPath;
}
