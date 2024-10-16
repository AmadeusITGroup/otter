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
    const { projectPath, workspacePath, projectName, isInWorkspace, untouchedProjectPath, o3rVersion } = o3rEnvironment.testEnvironment;
    const execAppOptions = {...getDefaultExecSyncOptions(), cwd: workspacePath};
    const relativeProjectPath = path.relative(workspacePath, projectPath);
    const projectNameOptions = ['--project-name', projectName];
    packageManagerExec({script: 'ng', args: ['add', `@o3r/core@${o3rVersion}`, '--preset', 'all', ...projectNameOptions, '--skip-confirmation']}, execAppOptions);
    expect(() => packageManagerInstall(execAppOptions)).not.toThrow();

    packageManagerExec({script: 'ng', args: ['g', '@o3r/core:store-entity-async', '--store-name', 'test-entity-async', '--model-name', 'Bound', '--model-id-prop-name', 'id', ...projectNameOptions]},
      execAppOptions
    );
    await addImportToAppModule(projectPath, 'TestEntityAsyncStoreModule', 'src/store/test-entity-async');

    packageManagerExec({script: 'ng', args: ['g', '@o3r/core:store-entity-sync', '--store-name', 'test-entity-sync', '--model-name', 'Bound', '--model-id-prop-name', 'id', ...projectNameOptions]},
      execAppOptions
    );
    await addImportToAppModule(projectPath, 'TestEntitySyncStoreModule', 'src/store/test-entity-sync');

    packageManagerExec({script: 'ng', args: ['g', '@o3r/core:store-simple-async', '--store-name', 'test-simple-async', '--model-name', 'Bound', ...projectNameOptions]},
      execAppOptions
    );
    await addImportToAppModule(projectPath, 'TestSimpleAsyncStoreModule', 'src/store/test-simple-async');

    packageManagerExec({script: 'ng', args: ['g', '@o3r/core:store-simple-sync', '--store-name', 'test-simple-sync', ...projectNameOptions]},
      execAppOptions
    );
    await addImportToAppModule(projectPath, 'TestSimpleSyncStoreModule', 'src/store/test-simple-sync');

    packageManagerExec({script: 'ng', args: ['g', '@o3r/core:service', 'test-service', '--feature-name', 'base', ...projectNameOptions]},
      execAppOptions
    );
    await addImportToAppModule(projectPath, 'TestServiceBaseModule', 'src/services/test-service');

    packageManagerExec({script: 'ng', args: ['g', '@o3r/core:page', 'test-page', '--app-routing-module-path', 'apps/test-app/src/app/app-routing.module.ts', ...projectNameOptions]},
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
    packageManagerExec({script: 'ng', args: ['g', '@o3r/core:component', 'test-component', ...defaultOptions, ...projectNameOptions]},
      execAppOptions
    );
    await addImportToAppModule(projectPath, 'TestComponentModule', 'src/components/test-component');

    const advancedOptions = [
      '--activate-dummy',
      '--use-otter-config', 'true',
      '--use-otter-theming', 'true',
      '--use-otter-analytics', 'true',
      '--use-localization', 'true',
      '--use-context', 'true',
      '--use-rules-engine', 'true'
    ];
    packageManagerExec({script: 'ng', args: ['g', '@o3r/core:component', 'test-component-advanced', ...advancedOptions, ...projectNameOptions]},
      execAppOptions
    );
    await addImportToAppModule(projectPath, 'TestComponentAdvancedModule', 'src/components/test-component-advanced');

    packageManagerExec({script: 'ng', args: ['g', '@o3r/core:component', 'test-add-context-component', ...defaultOptions, ...projectNameOptions]},
      execAppOptions
    );
    packageManagerExec({script: 'ng', args: ['g', '@o3r/core:add-context', '--path', 'apps/test-app/src/components/test-add-context-component/test-add-context-component.component.ts']},
      execAppOptions
    );
    await addImportToAppModule(projectPath, 'TestAddContextComponentModule', 'src/components/test-add-context-component');

    packageManagerExec({script: 'ng', args: ['g', '@schematics/angular:component', 'test-ng-component', '--project', projectName]},
      execAppOptions
    );
    packageManagerExec({script: 'ng', args: ['g', '@o3r/core:convert-component', '--path', 'apps/test-app/src/app/test-ng-component/test-ng-component.component.ts']},
      execAppOptions
    );

    packageManagerExec({script: 'ng', args: ['g', '@o3r/testing:playwright-scenario', '--name', 'test-scenario', ...projectNameOptions]}, execAppOptions);
    packageManagerExec({script: 'ng', args: ['g', '@o3r/testing:playwright-sanity', '--name', 'test-sanity', ...projectNameOptions]}, execAppOptions);

    const diff = getGitDiff(execAppOptions.cwd);

    if (untouchedProjectPath) {
      const relativeUntouchedProjectPath = path.relative(workspacePath, untouchedProjectPath);
      expect(diff.all.filter((file) => new RegExp(relativeUntouchedProjectPath.replace(/[\\/]+/g, '[\\\\/]')).test(file)).length).toBe(0);
    }

    // Expect created files inside `test-app` project
    expect(diff.added.filter((file) => new RegExp(path.join(relativeProjectPath, 'e2e-playwright').replace(/[\\/]+/g, '[\\\\/]')).test(file)).length).toBeGreaterThan(0);
    expect(diff.added.filter((file) => new RegExp(path.join(relativeProjectPath, 'src/app').replace(/[\\/]+/g, '[\\\\/]')).test(file)).length).toBeGreaterThan(0);
    expect(diff.added.filter((file) => new RegExp(path.join(relativeProjectPath, 'src/components').replace(/[\\/]+/g, '[\\\\/]')).test(file)).length).toBeGreaterThan(0);

    expect(diff.added.filter((file) => new RegExp(path.join(relativeProjectPath, 'src/services').replace(/[\\/]+/g, '[\\\\/]')).test(file)).length).toBeGreaterThan(0);
    expect(diff.added.filter((file) => new RegExp(path.join(relativeProjectPath, 'src/store').replace(/[\\/]+/g, '[\\\\/]')).test(file)).length).toBeGreaterThan(0);
    expect(diff.added.filter((file) => new RegExp(path.join(relativeProjectPath, 'src/styling').replace(/[\\/]+/g, '[\\\\/]')).test(file)).length).toBeGreaterThan(0);

    expect(() => packageManagerRunOnProject(projectName, isInWorkspace, {script: 'build'}, execAppOptions)).not.toThrow();

    // should pass the e2e tests
    spawn(`npx http-server -p ${devServerPort} ${path.join(relativeProjectPath, 'dist/browser')}`, [], {
      ...execAppOptions,
      shell: true,
      stdio: ['ignore', 'ignore', 'inherit']
    });
    execSync(`npx --yes wait-on http://127.0.0.1:${devServerPort} -t 20000`, execAppOptions);

    packageManagerExecOnProject(projectName, isInWorkspace, {script: 'playwright', args: ['install', '--with-deps']}, execAppOptions);
    expect(() => packageManagerRunOnProject(projectName, isInWorkspace, {script: 'test:playwright'}, execAppOptions)).not.toThrow();
    expect(() => packageManagerRunOnProject(projectName, isInWorkspace, {script: 'test:playwright:sanity'}, execAppOptions)).not.toThrow();
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
