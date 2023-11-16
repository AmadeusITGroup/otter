import {
  addImportToAppModule,
  getDefaultExecSyncOptions,
  packageManagerAdd,
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
    test('should build empty app', () => {
      packageManagerExec(`ng add --skip-confirmation @o3r/core@${o3rVersion} --preset=all`, execAppOptions);
      packageManagerExec(`ng add --skip-confirmation @o3r/analytics@${o3rVersion}`, execAppOptions);
      expect(() => packageManagerInstall(execAppOptions)).not.toThrow();

      packageManagerExec('ng g @o3r/core:store-entity-async --store-name="test-entity-async" --model-name="Bound" --model-id-prop-name="id"', execAppOptions);
      addImportToAppModule(appFolderPath, 'TestEntityAsyncStoreModule', 'src/store/test-entity-async');

      packageManagerExec('ng g @o3r/core:store-entity-sync --store-name="test-entity-sync" --model-name="Bound" --model-id-prop-name="id"', execAppOptions);
      addImportToAppModule(appFolderPath, 'TestEntitySyncStoreModule', 'src/store/test-entity-sync');

      packageManagerExec('ng g @o3r/core:store-simple-async --store-name="test-simple-async" --model-name="Bound"', execAppOptions);
      addImportToAppModule(appFolderPath, 'TestSimpleAsyncStoreModule', 'src/store/test-simple-async');

      packageManagerExec('ng g @o3r/core:store-simple-sync --store-name="test-simple-sync"', execAppOptions);
      addImportToAppModule(appFolderPath, 'TestSimpleSyncStoreModule', 'src/store/test-simple-sync');

      packageManagerExec('ng g @o3r/core:service test-service --feature-name="base"', execAppOptions);
      addImportToAppModule(appFolderPath, 'TestServiceBaseModule', 'src/services/test-service');

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
      addImportToAppModule(appFolderPath, 'TestComponentModule', 'src/components/test-component');

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
      addImportToAppModule(appFolderPath, 'TestComponentAdvancedModule', 'src/components/test-component-advanced');

      packageManagerExec(`ng g @o3r/core:component test-add-context-component ${defaultOptions}`, execAppOptions);
      packageManagerExec('ng g @o3r/core:add-context --path="src/components/test-add-context-component/test-add-context-component.component.ts"',
        execAppOptions);
      addImportToAppModule(appFolderPath, 'TestAddContextComponentModule', 'src/components/test-add-context-component');

      packageManagerExec('ng g @schematics/angular:component test-ng-component', execAppOptions);
      packageManagerExec('ng g @o3r/core:convert-component --path="src/app/test-ng-component/test-ng-component.component.ts"', execAppOptions);

      expect(() => packageManagerRun('build', execAppOptions)).not.toThrow();

      // should pass the e2e tests
      packageManagerExec('ng g @o3r/testing:playwright-scenario --name=test-scenario', execAppOptions);
      packageManagerExec('ng g @o3r/testing:playwright-sanity --name=test-sanity', execAppOptions);
      spawn(`npx http-server -p ${devServerPort} ./dist`, [], {
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
      const workspacePath = await prepareTestEnv(`${appName}-monorepo`, 'angular-monorepo');
      appFolderPath = join(workspacePath, 'projects', 'test-app');
      execAppOptions.cwd = workspacePath;
    });
    test('should build empty app', () => {
      // FIXME workaround for pnp
      packageManagerAdd(`@o3r/core@${o3rVersion} @o3r/analytics@${o3rVersion}`, execAppOptions);
      packageManagerAdd(`@o3r/core@${o3rVersion} @o3r/analytics@${o3rVersion}`, { ...execAppOptions, cwd: appFolderPath });

      packageManagerExec(`ng add --skip-confirmation @o3r/core@${o3rVersion}`, execAppOptions);

      const projectName = '--project-name=test-app';
      packageManagerExec(`ng add --skip-confirmation @o3r/core@${o3rVersion} --preset=all ${projectName}`, execAppOptions);
      packageManagerExec(`ng add --skip-confirmation @o3r/analytics@${o3rVersion} ${projectName}`, execAppOptions);
      expect(() => packageManagerInstall(execAppOptions)).not.toThrow();

      packageManagerExec(
        `ng g @o3r/core:store-entity-async --store-name="test-entity-async" --model-name="Bound" --model-id-prop-name="id" ${projectName}`,
        execAppOptions
      );
      addImportToAppModule(appFolderPath, 'TestEntityAsyncStoreModule', 'projects/test-app/src/store/test-entity-async');

      packageManagerExec(
        `ng g @o3r/core:store-entity-sync --store-name="test-entity-sync" --model-name="Bound" --model-id-prop-name="id" ${projectName}`,
        execAppOptions
      );
      addImportToAppModule(appFolderPath, 'TestEntitySyncStoreModule', 'projects/test-app/src/store/test-entity-sync');

      packageManagerExec(
        `ng g @o3r/core:store-simple-async --store-name="test-simple-async" --model-name="Bound" ${projectName}`,
        execAppOptions
      );
      addImportToAppModule(appFolderPath, 'TestSimpleAsyncStoreModule', 'projects/test-app/src/store/test-simple-async');

      packageManagerExec(
        `ng g @o3r/core:store-simple-sync --store-name="test-simple-sync" ${projectName}`,
        execAppOptions
      );
      addImportToAppModule(appFolderPath, 'TestSimpleSyncStoreModule', 'projects/test-app/src/store/test-simple-sync');

      packageManagerExec(
        `ng g @o3r/core:service test-service --feature-name="base" ${projectName}`,
        execAppOptions
      );
      addImportToAppModule(appFolderPath, 'TestServiceBaseModule', 'projects/test-app/src/services/test-service');

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
      addImportToAppModule(appFolderPath, 'TestComponentModule', 'projects/test-app/src/components/test-component');

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
      addImportToAppModule(appFolderPath, 'TestComponentAdvancedModule', 'projects/test-app/src/components/test-component-advanced');

      packageManagerExec(
        `ng g @o3r/core:component test-add-context-component ${defaultOptions} ${projectName}`,
        execAppOptions
      );
      packageManagerExec(
        'ng g @o3r/core:add-context --path="projects/test-app/src/components/test-add-context-component/test-add-context-component.component.ts"',
        execAppOptions
      );
      addImportToAppModule(appFolderPath, 'TestAddContextComponentModule', 'projects/test-app/src/components/test-add-context-component');

      packageManagerExec(
        'ng g @schematics/angular:component test-ng-component --project=test-app',
        execAppOptions
      );
      packageManagerExec(
        'ng g @o3r/core:convert-component --path="projects/test-app/src/app/test-ng-component/test-ng-component.component.ts"',
        execAppOptions
      );

      expect(() => packageManagerRun('build', execAppOptions)).not.toThrow();

      // should pass the e2e tests
      packageManagerExec(`ng g @o3r/testing:playwright-scenario --name=test-scenario ${projectName}`, execAppOptions);
      packageManagerExec(`ng g @o3r/testing:playwright-sanity --name=test-sanity ${projectName}`, execAppOptions);
      spawn(`npx http-server -p ${devServerPort} ./projects/test-app/dist`, [], {
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
