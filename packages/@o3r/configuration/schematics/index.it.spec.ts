import {
  addImportToAppModule,
  getDefaultExecSyncOptions,
  getGitDiff,
  packageManagerExec,
  packageManagerInstall,
  packageManagerRun,
  prepareTestEnv,
  setupLocalRegistry
} from '@o3r/test-helpers';

const appName = 'test-app-configuration';
const o3rVersion = '999.0.0';
const execAppOptions = getDefaultExecSyncOptions();
let appFolderPath: string;

describe('new otter application with configuration', () => {
  setupLocalRegistry();
  beforeAll(async () => {
    appFolderPath = await prepareTestEnv(appName, 'angular-with-o3r-core');
    execAppOptions.cwd = appFolderPath;
  });
  test('should add configuration to existing application', async () => {
    packageManagerExec(`ng add --skip-confirmation @o3r/configuration@${o3rVersion}`, execAppOptions);

    packageManagerExec('ng g @o3r/core:component test-component --use-otter-config=false', execAppOptions);
    packageManagerExec('ng g @o3r/configuration:add-config --path="src/components/test-component/test-component.component.ts"', execAppOptions);
    await addImportToAppModule(appFolderPath, 'TestComponentModule', 'src/components/test-component');

    const diff = getGitDiff(appFolderPath);
    expect(diff.modified).toContain('package.json');
    expect(diff.added).toContain('src/components/test-component/test-component.config.ts');

    expect(() => packageManagerInstall(execAppOptions)).not.toThrow();
    expect(() => packageManagerRun('build', execAppOptions)).not.toThrow();
  });
});
