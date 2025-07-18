/**
 * Test environment exported by O3rEnvironment, must be first line of the file
 * @jest-environment @o3r/test-helpers/jest-environment
 * @jest-environment-o3r-app-folder test-create-app
 * @jest-environment-o3r-type blank
 */
const o3rEnvironment = globalThis.o3rEnvironment;

import {
  existsSync,
  promises as fs,
} from 'node:fs';
import * as path from 'node:path';
import {
  getDefaultExecSyncOptions,
  getPackageManager,
  packageManagerCreate,
  packageManagerExec,
  packageManagerInstall,
  packageManagerRunOnProject,
  setPackagerManagerConfig,
} from '@o3r/test-helpers';

const defaultExecOptions = getDefaultExecSyncOptions();
const workspaceProjectName = 'my-project';

describe('Create new otter project command', () => {
  test('should generate a project with an application', async () => {
    const { workspacePath, packageManagerConfig, o3rVersion } = o3rEnvironment.testEnvironment;
    const inProjectPath = path.join(workspacePath, workspaceProjectName);
    const execWorkspaceOptions = { ...defaultExecOptions, cwd: workspacePath };
    const execInAppOptions = { ...defaultExecOptions, cwd: inProjectPath };
    const createOptions = [
      '--package-manager', getPackageManager(),
      '--preset basic',
      '--skip-confirmation', ...(packageManagerConfig.yarnVersion ? ['--yarn-version', packageManagerConfig.yarnVersion] : [])];

    // TODO: remove it when fixing #1356
    await fs.mkdir(inProjectPath, { recursive: true });
    setPackagerManagerConfig(packageManagerConfig, execInAppOptions);

    expect(() => packageManagerCreate({ script: `@o3r@${o3rVersion}`, args: [workspaceProjectName, ...createOptions] }, execWorkspaceOptions, 'npm')).not.toThrow();
    expect(existsSync(path.join(inProjectPath, 'angular.json'))).toBe(true);
    expect(existsSync(path.join(inProjectPath, 'package.json'))).toBe(true);
    expect(() => packageManagerInstall(execInAppOptions)).not.toThrow();

    const appName = 'test-application';
    const inApplicationPath = path.join(inProjectPath, 'apps', appName);
    expect(() => packageManagerExec({ script: 'ng', args: ['g', 'application', appName] }, execInAppOptions)).not.toThrow();
    expect(existsSync(path.join(inProjectPath, 'project'))).toBe(false);
    expect(existsSync(path.join(inApplicationPath, 'package.json'))).toBe(true);
    expect(existsSync(path.join(inApplicationPath, 'tsconfig.json'))).toBe(true);
    expect(() => packageManagerRunOnProject(appName, true, { script: 'build' }, execInAppOptions)).not.toThrow();
  });

  test('should generate a project with preset all', async () => {
    const { workspacePath, packageManagerConfig, o3rVersion } = o3rEnvironment.testEnvironment;
    const inProjectPath = path.join(workspacePath, workspaceProjectName);
    const execWorkspaceOptions = { ...defaultExecOptions, cwd: workspacePath };
    const execInAppOptions = { ...defaultExecOptions, cwd: inProjectPath };
    const createOptions = [
      '--package-manager', getPackageManager(),
      '--skip-confirmation',
      '--preset all',
      ...(packageManagerConfig.yarnVersion ? ['--yarn-version', packageManagerConfig.yarnVersion] : [])];

    // TODO: remove it when fixing #1356
    await fs.mkdir(inProjectPath, { recursive: true });
    setPackagerManagerConfig(packageManagerConfig, execInAppOptions);

    expect(() => packageManagerCreate({ script: `@o3r@${o3rVersion}`, args: [workspaceProjectName, ...createOptions] }, execWorkspaceOptions, 'npm')).not.toThrow();
    expect(existsSync(path.join(inProjectPath, 'angular.json'))).toBe(true);
    expect(existsSync(path.join(inProjectPath, 'package.json'))).toBe(true);
    expect(() => packageManagerInstall(execInAppOptions)).not.toThrow();

    const appName = 'test-application';
    const inApplicationPath = path.join(inProjectPath, 'apps', appName);
    expect(() => packageManagerExec({ script: 'ng', args: ['g', 'application', appName] }, execInAppOptions)).not.toThrow();
    expect(existsSync(path.join(inProjectPath, 'project'))).toBe(false);
    expect(existsSync(path.join(inApplicationPath, 'package.json'))).toBe(true);
    expect(existsSync(path.join(inApplicationPath, 'tsconfig.json'))).toBe(true);
    expect(() => packageManagerRunOnProject(appName, true, { script: 'build' }, execInAppOptions)).not.toThrow();
  });

  test('should generate a project with default preset (recommended)', async () => {
    const { workspacePath, packageManagerConfig, o3rVersion } = o3rEnvironment.testEnvironment;
    const inProjectPath = path.join(workspacePath, workspaceProjectName);
    const execWorkspaceOptions = { ...defaultExecOptions, cwd: workspacePath };
    const execInAppOptions = { ...defaultExecOptions, cwd: inProjectPath };
    const createOptions = [
      '--package-manager', getPackageManager(),
      '--skip-confirmation',
      ...(packageManagerConfig.yarnVersion ? ['--yarn-version', packageManagerConfig.yarnVersion] : [])];

    // TODO: remove it when fixing #1356
    await fs.mkdir(inProjectPath, { recursive: true });
    setPackagerManagerConfig(packageManagerConfig, execInAppOptions);

    expect(() => packageManagerCreate({ script: `@o3r@${o3rVersion}`, args: [workspaceProjectName, ...createOptions] }, execWorkspaceOptions, 'npm')).not.toThrow();
    expect(existsSync(path.join(inProjectPath, 'angular.json'))).toBe(true);

    const rootPackageJsonPath = path.join(inProjectPath, 'package.json');
    expect(existsSync(rootPackageJsonPath)).toBe(true);
    expect(() => packageManagerInstall(execInAppOptions)).not.toThrow();
    expect(JSON.parse(await fs.readFile(rootPackageJsonPath, 'utf8'))).not.toContain('@o3r/testing');

    const appName = 'test-application';
    const inApplicationPath = path.join(inProjectPath, 'apps', appName);
    expect(() => packageManagerExec({ script: 'ng', args: ['g', 'application', appName] }, execInAppOptions)).not.toThrow();
    expect(existsSync(path.join(inProjectPath, 'project'))).toBe(false);

    const appPackageJsonPath = path.join(inApplicationPath, 'package.json');
    expect(existsSync(appPackageJsonPath)).toBe(true);
    expect(JSON.parse(await fs.readFile(appPackageJsonPath, 'utf8'))).not.toContain('@o3r/testing');
    expect(existsSync(path.join(inApplicationPath, 'tsconfig.json'))).toBe(true);
    expect(() => packageManagerRunOnProject(appName, true, { script: 'build' }, execInAppOptions)).not.toThrow();
  });

  test('should generate a project with preset cms', async () => {
    const { workspacePath, packageManagerConfig, o3rVersion } = o3rEnvironment.testEnvironment;
    const inProjectPath = path.join(workspacePath, workspaceProjectName);
    const execWorkspaceOptions = { ...defaultExecOptions, cwd: workspacePath };
    const execInAppOptions = { ...defaultExecOptions, cwd: inProjectPath };
    const createOptions = [
      '--package-manager', getPackageManager(),
      '--skip-confirmation',
      '--preset cms',
      ...(packageManagerConfig.yarnVersion ? ['--yarn-version', packageManagerConfig.yarnVersion] : [])];

    // TODO: remove it when fixing #1356
    await fs.mkdir(inProjectPath, { recursive: true });
    setPackagerManagerConfig(packageManagerConfig, execInAppOptions);

    expect(() => packageManagerCreate({ script: `@o3r@${o3rVersion}`, args: [workspaceProjectName, ...createOptions] }, execWorkspaceOptions, 'npm')).not.toThrow();
    expect(existsSync(path.join(inProjectPath, 'angular.json'))).toBe(true);
    expect(existsSync(path.join(inProjectPath, 'package.json'))).toBe(true);
    expect(() => packageManagerInstall(execInAppOptions)).not.toThrow();

    const appName = 'test-application';
    const inApplicationPath = path.join(inProjectPath, 'apps', appName);
    expect(() => packageManagerExec({ script: 'ng', args: ['g', 'application', appName] }, execInAppOptions)).not.toThrow();
    expect(existsSync(path.join(inProjectPath, 'project'))).toBe(false);
    expect(existsSync(path.join(inApplicationPath, 'package.json'))).toBe(true);
    expect(existsSync(path.join(inApplicationPath, 'tsconfig.json'))).toBe(true);
    expect(() => packageManagerRunOnProject(appName, true, { script: 'build' }, execInAppOptions)).not.toThrow();
  });

  test('should generate a project with a library', async () => {
    const { workspacePath, packageManagerConfig, o3rVersion } = o3rEnvironment.testEnvironment;
    const inProjectPath = path.join(workspacePath, workspaceProjectName);
    const execWorkspaceOptions = { ...defaultExecOptions, cwd: workspacePath };
    const execInAppOptions = { ...defaultExecOptions, cwd: inProjectPath };
    const createOptions = ['--package-manager', getPackageManager(), '--skip-confirmation', ...(packageManagerConfig.yarnVersion ? ['--yarn-version', packageManagerConfig.yarnVersion] : [])];

    // TODO: remove it when fixing #1356
    await fs.mkdir(inProjectPath, { recursive: true });
    setPackagerManagerConfig(packageManagerConfig, execInAppOptions);

    expect(() => packageManagerCreate({ script: `@o3r@${o3rVersion}`, args: [workspaceProjectName, ...createOptions] }, execWorkspaceOptions, 'npm')).not.toThrow();
    expect(existsSync(path.join(inProjectPath, 'angular.json'))).toBe(true);
    expect(existsSync(path.join(inProjectPath, 'package.json'))).toBe(true);
    expect(() => packageManagerInstall(execInAppOptions)).not.toThrow();

    const libName = 'test-library';
    expect(() => packageManagerExec({ script: 'ng', args: ['g', 'library', libName] }, execInAppOptions)).not.toThrow();
    expect(existsSync(path.join(inProjectPath, 'project'))).toBe(false);
    expect(() => packageManagerRunOnProject(libName, true, { script: 'build' }, execInAppOptions)).not.toThrow();
  });

  test('should generate a project with an application with --exact-o3r-version', async () => {
    const { workspacePath, packageManagerConfig, o3rExactVersion } = o3rEnvironment.testEnvironment;
    const inProjectPath = path.join(workspacePath, workspaceProjectName);
    const execWorkspaceOptions = { ...defaultExecOptions, cwd: workspacePath };
    const execInAppOptions = { ...defaultExecOptions, cwd: inProjectPath };
    const packageManager = getPackageManager();
    const createOptions = ['--package-manager', packageManager, '--skip-confirmation', '--exact-o3r-version',
      ...(packageManagerConfig.yarnVersion ? ['--yarn-version', packageManagerConfig.yarnVersion] : [])];

    // TODO: remove it when fixing #1356
    await fs.mkdir(inProjectPath, { recursive: true });
    setPackagerManagerConfig(packageManagerConfig, execInAppOptions);

    expect(() => packageManagerCreate({ script: `@o3r@${o3rExactVersion}`, args: [workspaceProjectName, ...createOptions] }, execWorkspaceOptions, 'npm')).not.toThrow();
    expect(existsSync(path.join(inProjectPath, 'angular.json'))).toBe(true);
    expect(existsSync(path.join(inProjectPath, 'package.json'))).toBe(true);
    expect(() => packageManagerInstall(execInAppOptions)).not.toThrow();

    const appName = 'test-application';
    expect(() => packageManagerExec({ script: 'ng', args: ['g', 'application', appName] }, execInAppOptions)).not.toThrow();
    expect(existsSync(path.join(inProjectPath, 'project'))).toBe(false);
    expect(() => packageManagerRunOnProject(appName, true, { script: 'build' }, execInAppOptions)).not.toThrow();

    const rootPackageJson = JSON.parse(await fs.readFile(path.join(inProjectPath, 'package.json'), 'utf8'));
    const resolutions = packageManager === 'yarn' ? rootPackageJson.resolutions : rootPackageJson.overrides;
    const appPackageJson = JSON.parse(await fs.readFile(path.join(inProjectPath, 'apps', appName, 'package.json'), 'utf8'));
    // all otter dependencies in both package.json files must be pinned:
    [
      ...Object.entries(rootPackageJson.dependencies), ...Object.entries(rootPackageJson.devDependencies), ...Object.entries(resolutions),
      ...Object.entries(appPackageJson.dependencies), ...Object.entries(appPackageJson.devDependencies)
    ].filter(([dep]) => dep.startsWith('@o3r/') || dep.startsWith('@ama-sdk/')).forEach(([dep, version]) => {
      expect(`${dep}:${version as string}`).toBe(`${dep}:${o3rExactVersion}`);
    });
  });

  test('should generate a project with an application, with --exact-o3r-version and preset cms', async () => {
    const { workspacePath, packageManagerConfig, o3rExactVersion } = o3rEnvironment.testEnvironment;
    const inProjectPath = path.join(workspacePath, workspaceProjectName);
    const execWorkspaceOptions = { ...defaultExecOptions, cwd: workspacePath };
    const execInAppOptions = { ...defaultExecOptions, cwd: inProjectPath };
    const packageManager = getPackageManager();
    const createOptions = [
      '--package-manager', packageManager,
      '--skip-confirmation',
      '--exact-o3r-version',
      '--preset cms',
      ...(packageManagerConfig.yarnVersion ? ['--yarn-version', packageManagerConfig.yarnVersion] : [])];

    // TODO: remove it when fixing #1356
    await fs.mkdir(inProjectPath, { recursive: true });
    setPackagerManagerConfig(packageManagerConfig, execInAppOptions);

    expect(() => packageManagerCreate({ script: `@o3r@${o3rExactVersion}`, args: [workspaceProjectName, ...createOptions] }, execWorkspaceOptions, 'npm')).not.toThrow();
    expect(existsSync(path.join(inProjectPath, 'angular.json'))).toBe(true);
    expect(existsSync(path.join(inProjectPath, 'package.json'))).toBe(true);
    expect(() => packageManagerInstall(execInAppOptions)).not.toThrow();

    const appName = 'test-application';
    expect(() => packageManagerExec({ script: 'ng', args: ['g', 'application', appName] }, execInAppOptions)).not.toThrow();
    expect(existsSync(path.join(inProjectPath, 'project'))).toBe(false);
    expect(() => packageManagerRunOnProject(appName, true, { script: 'build' }, execInAppOptions)).not.toThrow();

    const rootPackageJson = JSON.parse(await fs.readFile(path.join(inProjectPath, 'package.json'), 'utf8'));
    const resolutions = packageManager === 'yarn' ? rootPackageJson.resolutions : rootPackageJson.overrides;
    const appPackageJson = JSON.parse(await fs.readFile(path.join(inProjectPath, 'apps', appName, 'package.json'), 'utf8'));
    // all otter dependencies in both package.json files must be pinned:
    [
      ...Object.entries(rootPackageJson.dependencies), ...Object.entries(rootPackageJson.devDependencies), ...Object.entries(resolutions),
      ...Object.entries(appPackageJson.dependencies), ...Object.entries(appPackageJson.devDependencies)
    ].filter(([dep]) => dep.startsWith('@o3r/') || dep.startsWith('@ama-sdk/')).forEach(([dep, version]) => {
      expect(`${dep}:${version as string}`).toBe(`${dep}:${o3rExactVersion}`);
    });
  });
});
