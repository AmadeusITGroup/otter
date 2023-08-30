import {
  getDefaultExecSyncOptions,
  packageManagerExec,
  packageManagerInstall,
  packageManagerRun,
  prepareTestEnv,
  setupLocalRegistry
} from '@o3r/test-helpers';

const appName = 'test-app-apis-components';
const o3rVersion = '999.0.0';
const execAppOptions = getDefaultExecSyncOptions();
let appFolderPath: string;

describe('new otter application with components', () => {
  setupLocalRegistry();
  beforeAll(async () => {
    appFolderPath = await prepareTestEnv(appName, 'angular-with-o3r-core');
    execAppOptions.cwd = appFolderPath;
  });
  test('should add components to existing application', () => {
    packageManagerExec(`ng add --skip-confirmation @o3r/components@${o3rVersion} --enable-metadata-extract`, execAppOptions);

    expect(() => packageManagerInstall(execAppOptions)).not.toThrow();
    expect(() => packageManagerRun('build', execAppOptions)).not.toThrow();
  });
});
