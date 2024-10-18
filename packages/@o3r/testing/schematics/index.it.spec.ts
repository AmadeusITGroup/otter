/**
 * Test environment exported by O3rEnvironment, must be first line of the file
 * @jest-environment @o3r/test-helpers/jest-environment
 * @jest-environment-o3r-app-folder test-app-testing
 */
const o3rEnvironment = globalThis.o3rEnvironment;

import {
  addImportToAppModule,
  getDefaultExecSyncOptions,
  getGitDiff,
  packageManagerExec,
  packageManagerInstall,
  packageManagerRunOnProject
} from '@o3r/test-helpers';
import * as path from 'node:path';
import * as fs from 'node:fs';

describe('ng add testing', () => {

  test('should add testing to an application', () => {
    const { workspacePath, appName, isInWorkspace, o3rVersion, libraryPath, untouchedProjectsPaths, applicationPath } = o3rEnvironment.testEnvironment;
    const execAppOptions = {...getDefaultExecSyncOptions(), cwd: workspacePath};
    packageManagerExec({script: 'ng', args: ['add', `@o3r/testing@${o3rVersion}`, '--skip-confirmation', '--project-name', appName]}, execAppOptions);

    const diff = getGitDiff(execAppOptions.cwd);
    expect(diff.added.length).toBe(0);
    expect(fs.readFileSync(path.join(applicationPath, 'package.json'), {encoding: 'utf8'})).toContain('@o3r/testing');

    [libraryPath, ...untouchedProjectsPaths].forEach((untouchedProject) => {
      expect(diff.all.some((file) => file.startsWith(path.posix.relative(workspacePath, untouchedProject)))).toBe(false);
    });


    expect(() => packageManagerInstall(execAppOptions)).not.toThrow();
    expect(() => packageManagerRunOnProject(appName, isInWorkspace, {script: 'build'}, execAppOptions)).not.toThrow();
    expect(() => packageManagerRunOnProject(appName, isInWorkspace, {script: 'test'}, execAppOptions)).not.toThrow();
  });

  test('should add testing to an application and fixture to component', async () => {

    const { applicationPath, workspacePath, appName, isInWorkspace, o3rVersion, untouchedProjectsPaths, libraryPath } = o3rEnvironment.testEnvironment;
    const execAppOptions = {...getDefaultExecSyncOptions(), cwd: workspacePath};
    const relativeApplicationPath = path.relative(workspacePath, applicationPath);
    packageManagerExec({script: 'ng', args: ['add', `@o3r/testing@${o3rVersion}`, '--skip-confirmation', '--project-name', appName]}, execAppOptions);

    const componentPath = path.join(relativeApplicationPath, 'src/components/test-component/container/test-component-cont.component.ts');
    packageManagerExec({script: 'ng',
      args: ['g', '@o3r/core:component', 'test-component', '--use-component-fixtures', 'false', '--component-structure', 'full', '--project-name', appName]}, execAppOptions);
    packageManagerExec({script: 'ng', args: ['g', '@o3r/testing:add-fixture', '--path', componentPath]}, execAppOptions);
    await addImportToAppModule(applicationPath, 'TestComponentContModule', 'src/components/test-component');

    const diff = getGitDiff(execAppOptions.cwd);
    expect(diff.added).toContain(path.join(relativeApplicationPath, 'src/components/test-component/container/test-component-cont.fixture.ts').replace(/[\\/]+/g, '/'));

    [libraryPath, ...untouchedProjectsPaths].forEach((untouchedProject) => {
      expect(diff.all.some((file) => file.startsWith(path.posix.relative(workspacePath, untouchedProject)))).toBe(false);
    });

    expect(() => packageManagerInstall(execAppOptions)).not.toThrow();
    expect(() => packageManagerRunOnProject(appName, isInWorkspace, {script: 'build'}, execAppOptions)).not.toThrow();
    expect(() => packageManagerRunOnProject(appName, isInWorkspace, {script: 'test'}, execAppOptions)).not.toThrow();
  });

  // TODO: fix #1765 first
  test.skip('should add testing to a library', () => {
    const { workspacePath, libName, isInWorkspace, o3rVersion, applicationPath, untouchedProjectsPaths } = o3rEnvironment.testEnvironment;
    const execAppOptions = {...getDefaultExecSyncOptions(), cwd: workspacePath};
    packageManagerExec({script: 'ng', args: ['add', `@o3r/testing@${o3rVersion}`, '--skip-confirmation', '--project-name', libName]}, execAppOptions);

    const diff = getGitDiff(execAppOptions.cwd);
    expect(diff.added.length).toBe(0);
    expect(diff.modified).toEqual(['libs/test-lib/package.json']);

    [applicationPath, ...untouchedProjectsPaths].forEach((untouchedProject) => {
      expect(diff.all.some((file) => file.startsWith(path.posix.relative(workspacePath, untouchedProject)))).toBe(false);
    });

    expect(() => packageManagerInstall(execAppOptions)).not.toThrow();
    expect(() => packageManagerRunOnProject(libName, isInWorkspace, {script: 'build'}, execAppOptions)).not.toThrow();
    expect(() => packageManagerRunOnProject(libName, isInWorkspace, {script: 'test'}, execAppOptions)).not.toThrow();
  });

  // TODO: fix #1765 first
  test.skip('should add testing to a library and fixture to component', () => {

    const { applicationPath, workspacePath, libName, isInWorkspace, o3rVersion, untouchedProjectsPaths, libraryPath } = o3rEnvironment.testEnvironment;
    const execAppOptions = {...getDefaultExecSyncOptions(), cwd: workspacePath};
    const relativeLibraryPath = path.relative(workspacePath, libraryPath);
    packageManagerExec({script: 'ng', args: ['add', `@o3r/testing@${o3rVersion}`, '--skip-confirmation', '--project-name', libName]}, execAppOptions);

    const componentPath = path.join(relativeLibraryPath, 'src/components/test-component/container/test-component-cont.component.ts');
    packageManagerExec({script: 'ng',
      args: ['g', '@o3r/core:component', 'test-component', '--use-component-fixtures', 'false', '--component-structure', 'full', '--project-name', libName]}, execAppOptions);
    packageManagerExec({script: 'ng', args: ['g', '@o3r/testing:add-fixture', '--path', componentPath]}, execAppOptions);

    const diff = getGitDiff(execAppOptions.cwd);
    expect(diff.added).toContain(path.join(relativeLibraryPath, 'src/components/test-component/container/test-component-cont.fixture.ts').replace(/[\\/]+/g, '/'));
    expect(diff.added.length).toBe(18);
    expect(diff.modified.length).toBe(6);

    [applicationPath, ...untouchedProjectsPaths].forEach((untouchedProject) => {
      expect(diff.all.some((file) => file.startsWith(path.posix.relative(workspacePath, untouchedProject)))).toBe(false);
    });

    expect(() => packageManagerInstall(execAppOptions)).not.toThrow();
    expect(() => packageManagerRunOnProject(libName, isInWorkspace, {script: 'build'}, execAppOptions)).not.toThrow();
    expect(() => packageManagerRunOnProject(libName, isInWorkspace, {script: 'test'}, execAppOptions)).not.toThrow();
  });

});
