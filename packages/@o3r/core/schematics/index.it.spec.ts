import {
  addImportToAppModule,
  getDefaultExecSyncOptions,
  getGitDiff,
  packageManagerExec,
  packageManagerInstall,
  packageManagerRun,
  packageManagerWorkspaceExec,
  packageManagerWorkspaceRun,
  prepareTestEnv,
  setupLocalRegistry
} from '@o3r/test-helpers';
import { join } from 'node:path';
import { execSync, spawn } from 'node:child_process';
import getPidFromPort from 'pid-from-port';

const devServerPort = 4200;
const appName = 'test-app-core';
const o3rVersion = '999.0.0';
const execAppOptions = getDefaultExecSyncOptions();
let appFolderPath: string;

describe('new otter application', () => {
  setupLocalRegistry();
  describe('standalone', () => {
    beforeAll(async () => {
      appFolderPath = await prepareTestEnv(appName, 'angular');
      execAppOptions.cwd = appFolderPath;
    });
    test('should build empty app', async () => {
      packageManagerExec(`ng add --skip-confirmation @o3r/core@${o3rVersion} --preset=all`, execAppOptions);
      packageManagerExec(`ng add --skip-confirmation @o3r/analytics@${o3rVersion}`, execAppOptions);
      expect(() => packageManagerInstall(execAppOptions)).not.toThrow();

      packageManagerExec('ng g @o3r/core:store-entity-async --store-name="test-entity-async" --model-name="Bound" --model-id-prop-name="id"', execAppOptions);
      await addImportToAppModule(appFolderPath, 'TestEntityAsyncStoreModule', 'src/store/test-entity-async');

      packageManagerExec('ng g @o3r/core:store-entity-sync --store-name="test-entity-sync" --model-name="Bound" --model-id-prop-name="id"', execAppOptions);
      await addImportToAppModule(appFolderPath, 'TestEntitySyncStoreModule', 'src/store/test-entity-sync');

      packageManagerExec('ng g @o3r/core:store-simple-async --store-name="test-simple-async" --model-name="Bound"', execAppOptions);
      await addImportToAppModule(appFolderPath, 'TestSimpleAsyncStoreModule', 'src/store/test-simple-async');

      packageManagerExec('ng g @o3r/core:store-simple-sync --store-name="test-simple-sync"', execAppOptions);
      await addImportToAppModule(appFolderPath, 'TestSimpleSyncStoreModule', 'src/store/test-simple-sync');

      packageManagerExec('ng g @o3r/core:service test-service --feature-name="base"', execAppOptions);
      await addImportToAppModule(appFolderPath, 'TestServiceBaseModule', 'src/services/test-service');

      packageManagerExec('ng g @o3r/core:page test-page --app-routing-module-path="src/app/app-routing.module.ts"', execAppOptions);

      const defaultOptions = [
        '--activate-dummy',
        '--use-otter-config=false',
        '--use-otter-theming=false',
        '--use-otter-analytics=false',
        '--use-localization=false',
        '--use-context=false',
        '--use-rules-engine=false'
      ].join(' ');
      packageManagerExec(`ng g @o3r/core:component test-component ${defaultOptions}`, execAppOptions);
      await addImportToAppModule(appFolderPath, 'TestComponentModule', 'src/components/test-component');

      const advancedOptions = [
        '--activate-dummy',
        '--use-otter-config=true',
        '--use-otter-theming=true',
        '--use-otter-analytics=true',
        '--use-localization=true',
        '--use-context=true',
        '--use-rules-engine=true'
      ].join(' ');
      packageManagerExec(`ng g @o3r/core:component test-component-advanced ${advancedOptions}`, execAppOptions);
      await addImportToAppModule(appFolderPath, 'TestComponentAdvancedModule', 'src/components/test-component-advanced');

      packageManagerExec(`ng g @o3r/core:component test-add-context-component ${defaultOptions}`, execAppOptions);
      packageManagerExec('ng g @o3r/core:add-context --path="src/components/test-add-context-component/test-add-context-component.component.ts"',
        execAppOptions);
      await addImportToAppModule(appFolderPath, 'TestAddContextComponentModule', 'src/components/test-add-context-component');

      packageManagerExec('ng g @schematics/angular:component test-ng-component', execAppOptions);
      packageManagerExec('ng g @o3r/core:convert-component --path="src/app/test-ng-component/test-ng-component.component.ts"', execAppOptions);

      packageManagerExec('ng g @o3r/testing:playwright-scenario --name=test-scenario', execAppOptions);
      packageManagerExec('ng g @o3r/testing:playwright-sanity --name=test-sanity', execAppOptions);

      const diff = getGitDiff(execAppOptions.cwd as string);

      // Expect created files inside `test-app` project
      expect(diff.added.filter((file) => /e2e-playwright/.test(file)).length).toBeGreaterThan(0);
      expect(diff.added.filter((file) => /src[\\/]app/.test(file)).length).toBeGreaterThan(0);
      expect(diff.added.filter((file) => /src[\\/]components/.test(file)).length).toBeGreaterThan(0);
      expect(diff.added.filter((file) => /src[\\/]environments/.test(file)).length).toBeGreaterThan(0);
      expect(diff.added.filter((file) => /src[\\/]services/.test(file)).length).toBeGreaterThan(0);
      expect(diff.added.filter((file) => /src[\\/]store/.test(file)).length).toBeGreaterThan(0);
      expect(diff.added.filter((file) => /src[\\/]styling/.test(file)).length).toBeGreaterThan(0);

      expect(() => packageManagerRun('build', execAppOptions)).not.toThrow();

      // should pass the e2e tests
      spawn(`npx http-server -p ${devServerPort} ./dist/browser`, [], {
        ...execAppOptions,
        shell: true,
        stdio: ['ignore', 'ignore', 'inherit']
      });
      execSync(`npx --yes wait-on http://127.0.0.1:${devServerPort} -t 20000`, execAppOptions);

      packageManagerExec('playwright install --with-deps', execAppOptions);
      expect(() => packageManagerRun('test:playwright', execAppOptions)).not.toThrow();
      expect(() => packageManagerRun('test:playwright:sanity', execAppOptions)).not.toThrow();
    });

    afterAll(async () => {
      try {
        const pid = await getPidFromPort(devServerPort);
        execSync(process.platform === 'win32' ? `taskkill /f /t /pid ${pid}` : `kill -15 ${pid}`, {stdio: 'inherit'});
      } catch (e) {
        // http-server already off
      }
    });
  });

  describe('monorepo', () => {
    beforeAll(async () => {
      // TODO Should not start the test with @o3r/core already installed
      const workspacePath = await prepareTestEnv(`${appName}-monorepo`, 'angular-monorepo-with-o3r-core');
      appFolderPath = join(workspacePath, 'projects', 'test-app');
      execAppOptions.cwd = workspacePath;
    });
    test('should build empty app', async () => {

      const projectName = '--project-name=test-app';
      packageManagerExec(`ng add --skip-confirmation @o3r/core@${o3rVersion} --preset=all ${projectName}`, execAppOptions);
      expect(() => packageManagerInstall(execAppOptions)).not.toThrow();

      packageManagerExec(
        `ng g @o3r/core:store-entity-async --store-name="test-entity-async" --model-name="Bound" --model-id-prop-name="id" ${projectName}`,
        execAppOptions
      );
      await addImportToAppModule(appFolderPath, 'TestEntityAsyncStoreModule', 'src/store/test-entity-async');

      packageManagerExec(
        `ng g @o3r/core:store-entity-sync --store-name="test-entity-sync" --model-name="Bound" --model-id-prop-name="id" ${projectName}`,
        execAppOptions
      );
      await addImportToAppModule(appFolderPath, 'TestEntitySyncStoreModule', 'src/store/test-entity-sync');

      packageManagerExec(
        `ng g @o3r/core:store-simple-async --store-name="test-simple-async" --model-name="Bound" ${projectName}`,
        execAppOptions
      );
      await addImportToAppModule(appFolderPath, 'TestSimpleAsyncStoreModule', 'src/store/test-simple-async');

      packageManagerExec(
        `ng g @o3r/core:store-simple-sync --store-name="test-simple-sync" ${projectName}`,
        execAppOptions
      );
      await addImportToAppModule(appFolderPath, 'TestSimpleSyncStoreModule', 'src/store/test-simple-sync');

      packageManagerExec(
        `ng g @o3r/core:service test-service --feature-name="base" ${projectName}`,
        execAppOptions
      );
      await addImportToAppModule(appFolderPath, 'TestServiceBaseModule', 'src/services/test-service');

      packageManagerExec(
        `ng g @o3r/core:page test-page --app-routing-module-path="projects/test-app/src/app/app-routing.module.ts" ${projectName}`,
        execAppOptions
      );

      const defaultOptions = [
        '--activate-dummy',
        '--use-otter-config=false',
        '--use-otter-theming=false',
        '--use-otter-analytics=false',
        '--use-localization=false',
        '--use-context=false',
        '--use-rules-engine=false'
      ].join(' ');
      packageManagerExec(
        `ng g @o3r/core:component test-component ${defaultOptions} ${projectName}`,
        execAppOptions
      );
      await addImportToAppModule(appFolderPath, 'TestComponentModule', 'src/components/test-component');

      const advancedOptions = [
        '--activate-dummy',
        '--use-otter-config=true',
        '--use-otter-theming=true',
        '--use-otter-analytics=true',
        '--use-localization=true',
        '--use-context=true',
        '--use-rules-engine=true'
      ].join(' ');
      packageManagerExec(
        `ng g @o3r/core:component test-component-advanced ${advancedOptions} ${projectName}`,
        execAppOptions
      );
      await addImportToAppModule(appFolderPath, 'TestComponentAdvancedModule', 'src/components/test-component-advanced');

      packageManagerExec(
        `ng g @o3r/core:component test-add-context-component ${defaultOptions} ${projectName}`,
        execAppOptions
      );
      packageManagerExec(
        'ng g @o3r/core:add-context --path="projects/test-app/src/components/test-add-context-component/test-add-context-component.component.ts"',
        execAppOptions
      );
      await addImportToAppModule(appFolderPath, 'TestAddContextComponentModule', 'src/components/test-add-context-component');

      packageManagerExec(
        'ng g @schematics/angular:component test-ng-component --project=test-app',
        execAppOptions
      );
      packageManagerExec(
        'ng g @o3r/core:convert-component --path="projects/test-app/src/app/test-ng-component/test-ng-component.component.ts"',
        execAppOptions
      );

      packageManagerExec(`ng g @o3r/testing:playwright-scenario --name=test-scenario ${projectName}`, execAppOptions);
      packageManagerExec(`ng g @o3r/testing:playwright-sanity --name=test-sanity ${projectName}`, execAppOptions);

      const diff = getGitDiff(execAppOptions.cwd as string);

      // Expect no file modified inside 'dont-modify-me' project
      expect(diff.all.filter((file) => /projects[\\/]dont-modify-me/.test(file)).length).toBe(0);

      // Expect no file created outside 'test-app' project
      expect(diff.added.filter((file) => !/projects[\\/]test-app/.test(file)).length).toBe(0);

      // Expect created files inside `test-app` project
      expect(diff.added.filter((file) => /projects[\\/]test-app[\\/]e2e-playwright/.test(file)).length).toBeGreaterThan(0);
      expect(diff.added.filter((file) => /projects[\\/]test-app[\\/]src[\\/]app/.test(file)).length).toBeGreaterThan(0);
      expect(diff.added.filter((file) => /projects[\\/]test-app[\\/]src[\\/]components/.test(file)).length).toBeGreaterThan(0);
      // TODO Should not start the test with @o3r/core already installed
      // expect(diff.added.filter((file) => /projects[\\/]test-app[\\/]src[\\/]environments/.test(file)).length).toBeGreaterThan(0);
      expect(diff.added.filter((file) => /projects[\\/]test-app[\\/]src[\\/]services/.test(file)).length).toBeGreaterThan(0);
      expect(diff.added.filter((file) => /projects[\\/]test-app[\\/]src[\\/]store/.test(file)).length).toBeGreaterThan(0);
      expect(diff.added.filter((file) => /projects[\\/]test-app[\\/]src[\\/]styling/.test(file)).length).toBeGreaterThan(0);

      expect(() => packageManagerRun('build', execAppOptions)).not.toThrow();

      // should pass the e2e tests
      spawn(`npx http-server -p ${devServerPort} ./projects/test-app/dist/browser`, [], {
        ...execAppOptions,
        shell: true,
        stdio: ['ignore', 'ignore', 'inherit']
      });
      execSync(`npx --yes wait-on http://127.0.0.1:${devServerPort} -t 20000`, execAppOptions);

      packageManagerWorkspaceExec('test-app-project', 'playwright install --with-deps', execAppOptions);
      expect(() => packageManagerWorkspaceRun('test-app-project', 'test:playwright', execAppOptions)).not.toThrow();
      expect(() => packageManagerWorkspaceRun('test-app-project', 'test:playwright:sanity', execAppOptions)).not.toThrow();
    });

    afterAll(async () => {
      try {
        const pid = await getPidFromPort(devServerPort);
        execSync(process.platform === 'win32' ? `taskkill /f /t /pid ${pid}` : `kill -15 ${pid}`, { stdio: 'inherit' });
      } catch (e) {
        // http-server already off
      }
    });
  });
});
