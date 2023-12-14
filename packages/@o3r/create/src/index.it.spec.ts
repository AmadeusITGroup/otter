import {
  getDefaultExecSyncOptions,
  getPackageManager,
  getYarnVersionFromRoot,
  packageManagerCreate,
  packageManagerExec,
  packageManagerInstall,
  prepareTestEnv,
  setupLocalRegistry
} from '@o3r/test-helpers';
import * as path from 'node:path';

const appName = 'test-create-app';
let baseFolderPath: string;
let appPackagePath: string;
const execAppOptions = getDefaultExecSyncOptions();
const packageManager = getPackageManager();

describe('Create new otter project command', () => {
  setupLocalRegistry();
  beforeEach(async () => {
    const isYarnTest = packageManager.startsWith('yarn');
    const yarnVersion = isYarnTest ? getYarnVersionFromRoot(process.cwd()) || 'latest' : undefined;
    baseFolderPath = await prepareTestEnv(appName, 'blank', yarnVersion);
    appPackagePath = path.join(baseFolderPath, appName);
    execAppOptions.cwd = baseFolderPath;
  });

  test('should generate a project with an application', () => {
    expect(() => packageManagerCreate(`@o3r ${appName}`, execAppOptions)).not.toThrow();
    expect(() => packageManagerInstall({ ...execAppOptions, cwd: appPackagePath })).not.toThrow();
    expect(() => packageManagerExec('ng g application my-app', { ...execAppOptions, cwd: appPackagePath })).not.toThrow();
    expect(() => packageManagerExec('ng build my-app', { ...execAppOptions, cwd: appPackagePath })).not.toThrow();
  });
});
