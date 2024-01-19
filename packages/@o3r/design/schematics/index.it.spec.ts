import {
  getDefaultExecSyncOptions,
  packageManagerExec,
  packageManagerInstall,
  packageManagerRun,
  prepareTestEnv,
  setupLocalRegistry
} from '@o3r/test-helpers';

const appName = 'test-app-design';
const o3rVersion = '999.0.0';
const execAppOptions = getDefaultExecSyncOptions();
let appFolderPath: string;

describe.skip('new otter application with Design', () => {
  setupLocalRegistry();
  beforeAll(async () => {
    appFolderPath = await prepareTestEnv(appName, 'angular-with-o3r-core');
    execAppOptions.cwd = appFolderPath;
  });
  test('should add design to existing application', () => {
    packageManagerExec(`ng add --skip-confirmation @o3r/design@${o3rVersion}`, execAppOptions);

    expect(() => packageManagerInstall(execAppOptions)).not.toThrow();
    expect(() => packageManagerRun('build', execAppOptions)).not.toThrow();
  });
});
