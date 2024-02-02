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

const appName = 'test-app-styling';
const o3rVersion = '999.0.0';
const execAppOptions = getDefaultExecSyncOptions();
let appFolderPath: string;

describe('new otter application with styling', () => {
  setupLocalRegistry();
  beforeAll(async () => {
    appFolderPath = await prepareTestEnv(appName, 'angular-with-o3r-core');
    execAppOptions.cwd = appFolderPath;
  });
  test('should add styling to existing application', async () => {
    packageManagerExec(`ng add --skip-confirmation @o3r/styling@${o3rVersion} --enable-metadata-extract`, execAppOptions);

    packageManagerExec('ng g @o3r/core:component --defaults=true test-component --use-otter-theming=false', execAppOptions);
    packageManagerExec('ng g @o3r/styling:add-theming --path="src/components/test-component/test-component.style.scss"', execAppOptions);
    await addImportToAppModule(appFolderPath, 'TestComponentModule', 'src/components/test-component');

    const diff = getGitDiff(execAppOptions.cwd as string);
    expect(diff.modified).toContain('package.json');
    expect(diff.added).toContain('src/components/test-component/test-component.style.theme.scss');

    expect(() => packageManagerInstall(execAppOptions)).not.toThrow();
    expect(() => packageManagerRun('build', execAppOptions)).not.toThrow();
  });
});
