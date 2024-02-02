import {
  getDefaultExecSyncOptions,
  getGitDiff,
  packageManagerExec,
  packageManagerInstall,
  packageManagerRun,
  prepareTestEnv,
  setupLocalRegistry
} from '@o3r/test-helpers';

const appName = 'test-app-extractors';
const o3rVersion = '999.0.0';
const execAppOptions = getDefaultExecSyncOptions();
let appFolderPath: string;

describe('new otter application with extractors', () => {
  setupLocalRegistry();
  beforeAll(async () => {
    appFolderPath = await prepareTestEnv(appName, 'angular-with-o3r-core');
    execAppOptions.cwd = appFolderPath;
  });
  test('should add extractors to existing application', () => {
    packageManagerExec(`ng add --skip-confirmation @o3r/extractors@${o3rVersion}`, execAppOptions);

    const diff = getGitDiff(appFolderPath);
    expect(diff.modified).toContain('package.json');

    expect(() => packageManagerInstall(execAppOptions)).not.toThrow();
    expect(() => packageManagerRun('build', execAppOptions)).not.toThrow();
  });
});
