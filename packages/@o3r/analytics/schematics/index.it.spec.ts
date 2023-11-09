import {
  addImportToAppModule,
  getDefaultExecSyncOptions,
  packageManagerAdd,
  packageManagerExec,
  packageManagerInstall,
  packageManagerRun,
  prepareTestEnv,
  setupLocalRegistry
} from '@o3r/test-helpers';
import { join } from 'node:path';

const appName = 'test-app-analytics';
const o3rVersion = '999.0.0';
const execAppOptions = getDefaultExecSyncOptions();
let appFolderPath: string;

describe('new otter application with analytics', () => {
  setupLocalRegistry();
  describe('standalone', () => {
    beforeAll(async () => {
      appFolderPath = await prepareTestEnv(appName, 'angular-with-o3r-core');
      execAppOptions.cwd = appFolderPath;
    });
    test('should add analytics to existing application', () => {
      packageManagerExec(`ng add --skip-confirmation @o3r/analytics@${o3rVersion}`, execAppOptions);

      packageManagerExec('ng g @o3r/core:component test-component --use-otter-analytics=false', execAppOptions);
      packageManagerExec('ng g @o3r/analytics:add-analytics --path="src/components/test-component/container/test-component-cont.component.ts"', execAppOptions);
      addImportToAppModule(appFolderPath, 'TestComponentContModule', 'src/components/test-component');

      expect(() => packageManagerInstall(execAppOptions)).not.toThrow();
      expect(() => packageManagerRun('build', execAppOptions)).not.toThrow();
    });
  });

  describe('monorepo', () => {
    beforeAll(async () => {
      const workspacePath = await prepareTestEnv(`${appName}-monorepo`, 'angular-monorepo-with-o3r-core');
      appFolderPath = join(workspacePath, 'projects', 'test-app');
      execAppOptions.cwd = workspacePath;
    });
    test('should add analytics to existing application', () => {
      // FIXME workaround for pnp
      packageManagerAdd(`@o3r/analytics@${o3rVersion}`, {...execAppOptions, cwd: appFolderPath});

      const projectName = '--project-name=test-app';
      packageManagerExec(`ng add --skip-confirmation @o3r/analytics@${o3rVersion} ${projectName}`, execAppOptions);

      packageManagerExec(`ng g @o3r/core:component test-component --use-otter-analytics=false ${projectName}`, execAppOptions);
      packageManagerExec(
        'ng g @o3r/analytics:add-analytics --path="projects/test-app/src/components/test-component/container/test-component-cont.component.ts"',
        execAppOptions
      );
      addImportToAppModule(appFolderPath, 'TestComponentContModule', 'projects/test-app/src/components/test-component');

      expect(() => packageManagerInstall(execAppOptions)).not.toThrow();
      expect(() => packageManagerRun('build', execAppOptions)).not.toThrow();
    });
  });
});
