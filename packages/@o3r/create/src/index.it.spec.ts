import {
  getDefaultExecSyncOptions,
  getPackageManager,
  type PackageManagerConfig,
  packageManagerCreate,
  packageManagerExec,
  packageManagerInstall,
  packageManagerRunOnProject,
  prepareTestEnv,
  setPackagerManagerConfig,
  setupLocalRegistry
} from '@o3r/test-helpers';
import { existsSync, promises as fs } from 'node:fs';
import * as path from 'node:path';

const appFolder = 'test-create-app';
const workspaceProjectName = 'my-project';
const o3rVersion = '999.0.0';
let workspacePath: string;
let packageManagerConfig: PackageManagerConfig;
const execWorkspaceOptions = getDefaultExecSyncOptions();

describe('Create new otter project command', () => {
  setupLocalRegistry();
  beforeEach(async () => {
    ({ workspacePath, packageManagerConfig, workspacePath } = (await prepareTestEnv(appFolder, {type: 'blank' })));
    execWorkspaceOptions.cwd = workspacePath;
  });

  afterAll(async () => {
    try { await fs.rm(workspacePath, { recursive: true }); } catch { /* ignore error */ }
  });

  test('should generate a project with an application', async () => {
    const createOptions = ['--package-manager', getPackageManager(), '--skip-confirmation', ...(packageManagerConfig.yarnVersion ? ['--yarn-version', packageManagerConfig.yarnVersion] : [])];
    const inAppPath = path.join(workspacePath, workspaceProjectName);
    const execInAppOptions = {...execWorkspaceOptions, cwd: inAppPath };

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
    const packageManager = getPackageManager();
    const createOptions = ['--package-manager', packageManager, '--skip-confirmation', '--exact-o3r-version',
      ...(packageManagerConfig.yarnVersion ? ['--yarn-version', packageManagerConfig.yarnVersion] : [])];
    const inAppPath = path.join(workspacePath, workspaceProjectName);
    const execInAppOptions = {...execWorkspaceOptions, cwd: inAppPath };

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
