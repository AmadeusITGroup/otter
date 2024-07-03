/**
 * Test environment exported by O3rEnvironment, must be first line of the file
 * @jest-environment @o3r/test-helpers/jest-environment
 * @jest-environment-o3r-app-folder test-create-app
 * @jest-environment-o3r-type blank
 */
const o3rEnvironment = globalThis.o3rEnvironment;

import {
  getDefaultExecSyncOptions,
  getPackageManager,
  packageManagerCreate,
  packageManagerExec,
  packageManagerInstall,
  packageManagerRunOnProject,
  setPackagerManagerConfig
} from '@o3r/test-helpers';
import { existsSync, promises as fs } from 'node:fs';
import * as path from 'node:path';

const defaultExecOptions = getDefaultExecSyncOptions();
const workspaceProjectName = 'my-project';

describe('Create new otter project command', () => {
  test('should generate a project with an application', async () => {
    const { workspacePath, packageManagerConfig, o3rVersion } = o3rEnvironment.testEnvironment;
    const inAppPath = path.join(workspacePath, workspaceProjectName);
    const execWorkspaceOptions = {...defaultExecOptions, cwd: workspacePath };
    const execInAppOptions = {...defaultExecOptions, cwd: inAppPath };
    const createOptions = ['--package-manager', getPackageManager(), '--skip-confirmation', ...(packageManagerConfig.yarnVersion ? ['--yarn-version', packageManagerConfig.yarnVersion] : [])];

    // TODO: remove it when fixing #1356
    await fs.mkdir(inAppPath, { recursive: true });
    setPackagerManagerConfig(packageManagerConfig, execInAppOptions);

    expect(() => packageManagerCreate({ script: `@o3r@${o3rVersion}`, args: [workspaceProjectName, ...createOptions] }, execWorkspaceOptions, 'npm')).not.toThrow();
    expect(existsSync(path.join(inAppPath, 'angular.json'))).toBe(true);
    expect(existsSync(path.join(inAppPath, 'package.json'))).toBe(true);
    expect(() => packageManagerInstall(execInAppOptions)).not.toThrow();

    const appName = 'test-application';
    expect(() => packageManagerExec({ script: 'ng', args: ['g', 'application', appName] }, execInAppOptions)).not.toThrow();
    expect(existsSync(path.join(inAppPath, 'project'))).toBe(false);
    expect(() => packageManagerRunOnProject(appName, true, { script: 'build' }, execInAppOptions)).not.toThrow();
  });

  test('should generate a project with an application with --exact-o3r-version', async () => {
    const { workspacePath, packageManagerConfig, o3rVersion } = o3rEnvironment.testEnvironment;
    const inAppPath = path.join(workspacePath, workspaceProjectName);
    const execWorkspaceOptions = {...defaultExecOptions, cwd: workspacePath };
    const execInAppOptions = {...defaultExecOptions, cwd: inAppPath };
    const packageManager = getPackageManager();
    const createOptions = ['--package-manager', packageManager, '--skip-confirmation', '--exact-o3r-version',
      ...(packageManagerConfig.yarnVersion ? ['--yarn-version', packageManagerConfig.yarnVersion] : [])];

    // TODO: remove it when fixing #1356
    await fs.mkdir(inAppPath, { recursive: true });
    setPackagerManagerConfig(packageManagerConfig, execInAppOptions);

    expect(() => packageManagerCreate({ script: `@o3r@${o3rVersion}`, args: [workspaceProjectName, ...createOptions] }, execWorkspaceOptions, 'npm')).not.toThrow();
    expect(existsSync(path.join(inAppPath, 'angular.json'))).toBe(true);
    expect(existsSync(path.join(inAppPath, 'package.json'))).toBe(true);
    expect(() => packageManagerInstall(execInAppOptions)).not.toThrow();

    const appName = 'test-application';
    expect(() => packageManagerExec({ script: 'ng', args: ['g', 'application', appName, '--exact-o3r-version'] }, execInAppOptions)).not.toThrow();
    expect(existsSync(path.join(inAppPath, 'project'))).toBe(false);
    expect(() => packageManagerRunOnProject(appName, true, { script: 'build' }, execInAppOptions)).not.toThrow();

    const rootPackageJson = JSON.parse(await fs.readFile(path.join(inAppPath, 'package.json'), 'utf-8'));
    const resolutions = packageManager === 'yarn' ? rootPackageJson.resolutions : rootPackageJson.overrides;
    const appPackageJson = JSON.parse(await fs.readFile(path.join(inAppPath, 'apps', appName, 'package.json'), 'utf-8'));
    // all otter dependencies in both package.json files must be pinned:
    [
      ...Object.entries(rootPackageJson.dependencies), ...Object.entries(rootPackageJson.devDependencies), ...Object.entries(resolutions),
      ...Object.entries(appPackageJson.dependencies), ...Object.entries(appPackageJson.devDependencies)
    ].filter(([dep]) => dep.startsWith('@o3r/') || dep.startsWith('@ama-sdk/')).forEach(([,version]) => {
      expect(version).toBe(o3rVersion);
    });
  });
});
