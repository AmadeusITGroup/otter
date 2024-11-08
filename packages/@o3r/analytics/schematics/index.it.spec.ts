/**
 * Test environment exported by O3rEnvironment, must be first line of the file
 * @jest-environment @o3r/test-helpers/jest-environment
 * @jest-environment-o3r-app-folder test-app-analytics
 */
const o3rEnvironment = globalThis.o3rEnvironment;

import * as path from 'node:path';
import {
  addImportToAppModule,
  getDefaultExecSyncOptions,
  getGitDiff,
  packageManagerExec,
  packageManagerInstall,
  packageManagerRunOnProject,
} from '@o3r/test-helpers';

describe('ng add analytics', () => {
  test('should add analytics to an application', async () => {
    const { applicationPath, workspacePath, appName, isInWorkspace, isYarnTest, untouchedProjectsPaths, o3rVersion, libraryPath } = o3rEnvironment.testEnvironment;
    const execAppOptions = { ...getDefaultExecSyncOptions(), cwd: workspacePath };
    const relativeApplicationPath = path.relative(workspacePath, applicationPath);
    expect(() => packageManagerExec({ script: 'ng', args: ['add', `@o3r/analytics@${o3rVersion}`, '--project-name', appName, '--skip-confirmation'] }, execAppOptions)).not.toThrow();

    packageManagerExec({ script: 'ng', args: ['g', '@o3r/core:component', 'test-component', '--use-otter-analytics', 'false', '--project-name', appName] }, execAppOptions);
    const componentPath = path.normalize(path.posix.join(relativeApplicationPath, 'src/components/test-component/test-component.component.ts'));
    packageManagerExec({ script: 'ng', args: ['g', '@o3r/analytics:add-analytics', '--path', componentPath] }, execAppOptions);
    await addImportToAppModule(applicationPath, 'TestComponentModule', 'src/components/test-component');

    const diff = getGitDiff(workspacePath);

    expect(diff.added).toContain(path.join(relativeApplicationPath, 'src/components/test-component/test-component.analytics.ts').replace(/[/\\]+/g, '/'));
    expect(diff.added.length).toBe(10);
    expect(diff.modified.sort()).toEqual([
      'angular.json',
      'apps/test-app/package.json',
      'apps/test-app/src/app/app.component.ts',
      'package.json',
      isYarnTest ? 'yarn.lock' : 'package-lock.json'
    ].sort());

    [libraryPath, ...untouchedProjectsPaths].forEach((untouchedProject) => {
      expect(diff.all.some((file) => file.startsWith(path.posix.relative(workspacePath, untouchedProject)))).toBe(false);
    });
    expect(() => packageManagerInstall(execAppOptions)).not.toThrow();
    expect(() => packageManagerRunOnProject(appName, isInWorkspace, { script: 'build' }, execAppOptions)).not.toThrow();
  });

  test('should add analytics to a library', () => {
    const { applicationPath, workspacePath, libName, isInWorkspace, isYarnTest, o3rVersion, libraryPath, untouchedProjectsPaths } = o3rEnvironment.testEnvironment;
    const execAppOptions = { ...getDefaultExecSyncOptions(), cwd: workspacePath };
    const relativeLibraryPath = path.relative(workspacePath, libraryPath);
    expect(() => packageManagerExec({ script: 'ng', args: ['add', `@o3r/analytics@${o3rVersion}`, '--project-name', libName, '--skip-confirmation'] }, execAppOptions)).not.toThrow();

    packageManagerExec({ script: 'ng', args: ['g', '@o3r/core:component', 'test-component', '--use-otter-analytics', 'false', '--project-name', libName] }, execAppOptions);
    const componentPath = path.normalize(path.posix.join(relativeLibraryPath, 'src/components/test-component/test-component.component.ts'));
    packageManagerExec({ script: 'ng', args: ['g', '@o3r/analytics:add-analytics', '--path', componentPath] }, execAppOptions);

    const diff = getGitDiff(workspacePath);

    expect(diff.added).toContain(path.join(relativeLibraryPath, 'src/components/test-component/test-component.analytics.ts').replace(/[/\\]+/g, '/'));
    expect(diff.added.length).toBe(10);
    expect(diff.modified.sort()).toEqual([
      'angular.json',
      'libs/test-lib/package.json',
      'package.json',
      isYarnTest ? 'yarn.lock' : 'package-lock.json'
    ].sort());

    [applicationPath, ...untouchedProjectsPaths].forEach((untouchedProject) => {
      expect(diff.all.some((file) => file.startsWith(path.posix.relative(workspacePath, untouchedProject)))).toBe(false);
    });
    expect(() => packageManagerInstall(execAppOptions)).not.toThrow();
    expect(() => packageManagerRunOnProject(libName, isInWorkspace, { script: 'build' }, execAppOptions)).not.toThrow();
  });
});
