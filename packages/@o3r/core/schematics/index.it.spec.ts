/**
 * Test environment exported by O3rEnvironment, must be first line of the file
 * @jest-environment @o3r/test-helpers/jest-environment
 * @jest-environment-o3r-app-folder test-app-core
 */
const o3rEnvironment = globalThis.o3rEnvironment;

import {
  addImportToAppModule,
  getDefaultExecSyncOptions,
  getGitDiff,
  packageManagerExec,
  packageManagerExecOnProject,
  packageManagerInstall,
  packageManagerRunOnProject
} from '@o3r/test-helpers';
import * as path from 'node:path';
import { execSync, spawn } from 'node:child_process';
import getPidFromPort from 'pid-from-port';

const devServerPort = 4200;
describe('new otter application', () => {
  test('should build empty app', async () => {
    const { applicationPath, workspacePath, appName, isInWorkspace, o3rVersion, untouchedProjectsPaths } = o3rEnvironment.testEnvironment;
    const execAppOptions = {...getDefaultExecSyncOptions(), cwd: workspacePath};
    const relativeApplicationPath = path.relative(workspacePath, applicationPath);
    const appNameOptions = ['--project-name', appName];
    expect(() => packageManagerExec({script: 'ng', args: ['add', `@o3r/core@${o3rVersion}`, '--preset', 'all', ...appNameOptions, '--skip-confirmation']}, execAppOptions)).not.toThrow();
    expect(() => packageManagerInstall(execAppOptions)).not.toThrow();

    packageManagerExec({script: 'ng', args: ['g', '@o3r/core:store-entity-async', '--store-name', 'test-entity-async', '--model-name', 'Bound', '--model-id-prop-name', 'id', ...appNameOptions]},
      execAppOptions
    );
    await addImportToAppModule(applicationPath, 'TestEntityAsyncStoreModule', 'src/store/test-entity-async');

    packageManagerExec({script: 'ng', args: ['g', '@o3r/core:store-entity-sync', '--store-name', 'test-entity-sync', '--model-name', 'Bound', '--model-id-prop-name', 'id', ...appNameOptions]},
      execAppOptions
    );
    await addImportToAppModule(applicationPath, 'TestEntitySyncStoreModule', 'src/store/test-entity-sync');

    packageManagerExec({script: 'ng', args: ['g', '@o3r/core:store-simple-async', '--store-name', 'test-simple-async', '--model-name', 'Bound', ...appNameOptions]},
      execAppOptions
    );
    await addImportToAppModule(applicationPath, 'TestSimpleAsyncStoreModule', 'src/store/test-simple-async');

    packageManagerExec({script: 'ng', args: ['g', '@o3r/core:store-simple-sync', '--store-name', 'test-simple-sync', ...appNameOptions]},
      execAppOptions
    );
    await addImportToAppModule(applicationPath, 'TestSimpleSyncStoreModule', 'src/store/test-simple-sync');

    packageManagerExec({script: 'ng', args: ['g', '@o3r/core:service', 'test-service', '--feature-name', 'base', ...appNameOptions]},
      execAppOptions
    );
    await addImportToAppModule(applicationPath, 'TestServiceBaseModule', 'src/services/test-service');

    packageManagerExec({script: 'ng', args: ['g', '@o3r/core:page', 'test-page', ...appNameOptions]},
      execAppOptions
    );

    const defaultOptions = [
      '--activate-dummy',
      '--use-otter-config', 'false',
      '--use-otter-theming', 'false',
      '--use-otter-analytics', 'false',
      '--use-localization', 'false',
      '--use-context', 'false',
      '--use-rules-engine', 'false'
    ];
    packageManagerExec({script: 'ng', args: ['g', '@o3r/core:component', 'test-component', ...defaultOptions, ...appNameOptions]},
      execAppOptions
    );
    await addImportToAppModule(applicationPath, 'TestComponentModule', 'src/components/test-component');

    const advancedOptions = [
      '--activate-dummy',
      '--use-otter-config', 'true',
      '--use-otter-theming', 'true',
      '--use-otter-analytics', 'true',
      '--use-localization', 'true',
      '--use-context', 'true',
      '--use-rules-engine', 'true'
    ];
    packageManagerExec({script: 'ng', args: ['g', '@o3r/core:component', 'test-component-advanced', ...advancedOptions, ...appNameOptions]},
      execAppOptions
    );
    await addImportToAppModule(applicationPath, 'TestComponentAdvancedModule', 'src/components/test-component-advanced');

    packageManagerExec({script: 'ng', args: ['g', '@o3r/core:component', 'test-add-context-component', ...defaultOptions, ...appNameOptions]},
      execAppOptions
    );
    packageManagerExec({script: 'ng', args: ['g', '@o3r/core:add-context', '--path', 'apps/test-app/src/components/test-add-context-component/test-add-context-component.component.ts']},
      execAppOptions
    );
    await addImportToAppModule(applicationPath, 'TestAddContextComponentModule', 'src/components/test-add-context-component');

    packageManagerExec({script: 'ng', args: ['g', '@schematics/angular:component', 'test-ng-component', '--project', appName]},
      execAppOptions
    );
    packageManagerExec({script: 'ng', args: ['g', '@o3r/core:convert-component', '--path', 'apps/test-app/src/app/test-ng-component/test-ng-component.component.ts']},
      execAppOptions
    );

    packageManagerExec({script: 'ng', args: ['g', '@o3r/testing:playwright-scenario', '--name', 'test-scenario', ...appNameOptions]}, execAppOptions);
    packageManagerExec({script: 'ng', args: ['g', '@o3r/testing:playwright-sanity', '--name', 'test-sanity', ...appNameOptions]}, execAppOptions);

    const diff = getGitDiff(execAppOptions.cwd);

    untouchedProjectsPaths.forEach((untouchedProject) => {
      expect(diff.all.some((file) => file.startsWith(path.posix.relative(workspacePath, untouchedProject)))).toBe(false);
    });

    // Expect created files inside `test-app` project
    expect(diff.added.filter((file) => new RegExp(path.posix.join(relativeApplicationPath, 'e2e-playwright').replace(/[\\/]+/g, '[\\\\/]')).test(file)).length).toBeGreaterThan(0);
    expect(diff.added.filter((file) => new RegExp(path.posix.join(relativeApplicationPath, 'src/app').replace(/[\\/]+/g, '[\\\\/]')).test(file)).length).toBeGreaterThan(0);
    expect(diff.added.filter((file) => new RegExp(path.posix.join(relativeApplicationPath, 'src/components').replace(/[\\/]+/g, '[\\\\/]')).test(file)).length).toBeGreaterThan(0);

    expect(diff.added.filter((file) => new RegExp(path.posix.join(relativeApplicationPath, 'src/services').replace(/[\\/]+/g, '[\\\\/]')).test(file)).length).toBeGreaterThan(0);
    expect(diff.added.filter((file) => new RegExp(path.posix.join(relativeApplicationPath, 'src/store').replace(/[\\/]+/g, '[\\\\/]')).test(file)).length).toBeGreaterThan(0);
    expect(diff.added.filter((file) => new RegExp(path.posix.join(relativeApplicationPath, 'src/styling').replace(/[\\/]+/g, '[\\\\/]')).test(file)).length).toBeGreaterThan(0);

    expect(diff.modified).toContainEqual(expect.stringMatching(new RegExp(path.posix.join(relativeApplicationPath, 'src/app/app.routes.ts').replace(/[\\/]+/g, '[\\\\/]'))));

    expect(() => packageManagerRunOnProject(appName, isInWorkspace, {script: 'build'}, execAppOptions)).not.toThrow();

    // should pass the e2e tests
    spawn(`npx http-server -p ${devServerPort} ${path.posix.join(relativeApplicationPath, 'dist/browser')}`, [], {
      ...execAppOptions,
      shell: true,
      stdio: ['ignore', 'ignore', 'inherit']
    });
    execSync(`npx --yes wait-on http://127.0.0.1:${devServerPort} -t 20000`, execAppOptions);

    packageManagerExecOnProject(appName, isInWorkspace, {script: 'playwright', args: ['install', '--with-deps']}, execAppOptions);
    expect(() => packageManagerRunOnProject(appName, isInWorkspace, {script: 'test:playwright'}, execAppOptions)).not.toThrow();
    expect(() => packageManagerRunOnProject(appName, isInWorkspace, {script: 'test:playwright:sanity'}, execAppOptions)).not.toThrow();
  });

  afterAll(async () => {
    try {
      const pid = await getPidFromPort(devServerPort);
      execSync(process.platform === 'win32' ? `taskkill /f /t /pid ${pid}` : `kill -15 ${pid}`, { stdio: 'inherit' });
    } catch {
      // http-server already off
    }
  });
});
