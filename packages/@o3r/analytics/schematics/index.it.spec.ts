import {
  addImportToAppModule,
  getDefaultExecSyncOptions,
  getGitDiff,
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
    test('should add analytics to existing application', async () => {
      packageManagerExec(`ng add --skip-confirmation @o3r/analytics@${o3rVersion}`, execAppOptions);

      packageManagerExec('ng g @o3r/core:component test-component --use-otter-analytics=false', execAppOptions);
      packageManagerExec('ng g @o3r/analytics:add-analytics --path="src/components/test-component/test-component.component.ts"', execAppOptions);
      await addImportToAppModule(appFolderPath, 'TestComponentModule', 'src/components/test-component');

      const diff = getGitDiff(appFolderPath);
      expect(diff.modified).toContain('package.json');
      expect(diff.added).toContain('src/components/test-component/test-component.analytics.ts');

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
        'ng g @o3r/analytics:add-analytics --path="projects/test-app/src/components/test-component/test-component.component.ts"',
        execAppOptions
      );
      addImportToAppModule(appFolderPath, 'TestComponentModule', 'src/components/test-component');

      const diff = getGitDiff(execAppOptions.cwd as string);
      expect(diff.all.some((file) => /projects[\\/]dont-modify-me/.test(file))).toBe(false);
      expect(diff.modified).toContain('projects/test-app/package.json');
      expect(diff.added).toContain('projects/test-app/src/components/test-component/test-component.analytics.ts');

      expect(() => packageManagerInstall(execAppOptions)).not.toThrow();
      expect(() => packageManagerRun('build', execAppOptions)).not.toThrow();
    });
  });
});
