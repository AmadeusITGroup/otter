/**
 * Test environment exported by O3rEnvironment, must be first line of the file
 * @jest-environment @o3r/test-helpers/jest-environment
 * @jest-environment-o3r-app-folder test-app-localization
 */
import * as path from 'node:path';
import {
  addImportToAppModule,
  getDefaultExecSyncOptions,
  getGitDiff,
  packageManagerExec,
  packageManagerInstall,
  packageManagerRunOnProject
} from '@o3r/test-helpers';

const o3rEnvironment = globalThis.o3rEnvironment;

describe('ng add otter localization', () => {
  test('should add localization to an application', async () => {
    const { applicationPath, workspacePath, appName, isInWorkspace, o3rVersion, libraryPath, untouchedProjectsPaths } = o3rEnvironment.testEnvironment;
    const execAppOptions = { ...getDefaultExecSyncOptions(), cwd: workspacePath };
    const relativeApplicationPath = path.relative(workspacePath, applicationPath);
    expect(() => packageManagerExec({ script: 'ng', args: ['add', `@o3r/localization@${o3rVersion}`, '--skip-confirmation', '--project-name', appName] }, execAppOptions)).not.toThrow();

    const componentPath = path.normalize(path.posix.join(relativeApplicationPath, 'src/components/test-component/test-component.component.ts'));
    packageManagerExec({ script: 'ng', args: ['g', '@o3r/core:component', 'test-component', '--project-name', appName, '--use-localization', 'false'] }, execAppOptions);
    packageManagerExec({ script: 'ng', args: ['g', '@o3r/localization:add-localization', '--activate-dummy', '--path', componentPath] }, execAppOptions);
    await addImportToAppModule(applicationPath, 'TestComponentModule', 'src/components/test-component');

    const diff = getGitDiff(workspacePath);
    expect(diff.modified.length).toBe(9);
    expect(diff.added.length).toBe(16);
    expect(diff.added).toContain(path.join(relativeApplicationPath, 'src/components/test-component/test-component.localization.json').replace(/[/\\]+/g, '/'));
    expect(diff.added).toContain(path.join(relativeApplicationPath, 'src/components/test-component/test-component.translation.ts').replace(/[/\\]+/g, '/'));

    [libraryPath, ...untouchedProjectsPaths].forEach((untouchedProject) => {
      expect(diff.all.some((file) => file.startsWith(path.posix.relative(workspacePath, untouchedProject)))).toBe(false);
    });

    expect(() => packageManagerInstall(execAppOptions)).not.toThrow();
    expect(() => packageManagerRunOnProject(appName, isInWorkspace, { script: 'build' }, execAppOptions)).not.toThrow();
  });

  test('should add localization to a library', () => {
    const { workspacePath, isInWorkspace, untouchedProjectsPaths, o3rVersion, libraryPath, libName, applicationPath, isYarnTest } = o3rEnvironment.testEnvironment;
    const execAppOptions = { ...getDefaultExecSyncOptions(), cwd: workspacePath };
    const relativeLibraryPath = path.relative(workspacePath, libraryPath);
    expect(() => packageManagerExec({ script: 'ng', args: ['add', `@o3r/localization@${o3rVersion}`, '--skip-confirmation', '--project-name', libName] }, execAppOptions)).not.toThrow();

    const componentPath = path.normalize(path.posix.join(relativeLibraryPath, 'src/components/test-component/test-component.component.ts'));
    packageManagerExec({ script: 'ng', args: ['g', '@o3r/core:component', 'test-component', '--project-name', libName, '--use-localization', 'false'] }, execAppOptions);
    packageManagerExec({ script: 'ng', args: ['g', '@o3r/localization:add-localization', '--activate-dummy', '--path', componentPath] }, execAppOptions);

    const diff = getGitDiff(workspacePath);
    const modifiedFiles = [
      path.join(relativeLibraryPath, '.gitignore').replace(/[/\\]+/g, '/'),
      path.join(relativeLibraryPath, 'package.json').replace(/[/\\]+/g, '/'),
      '.gitignore',
      'angular.json',
      'package.json',
      isYarnTest ? 'yarn.lock' : 'package-lock.json'
    ];
    modifiedFiles.forEach((modifiedFile) => {
      expect(diff.modified).toContain(modifiedFile);
    });
    expect(diff.modified.length).toBe(modifiedFiles.length);
    const addedFiles = [
      path.join(relativeLibraryPath, 'src/components/test-component/test-component.localization.json').replace(/[/\\]+/g, '/'),
      path.join(relativeLibraryPath, 'src/components/test-component/test-component.translation.ts').replace(/[/\\]+/g, '/')
    ];
    addedFiles.forEach((addedFile) => {
      expect(diff.added).toContain(addedFile);
    });
    expect(diff.added.length).toBe(addedFiles.length + 12);

    [applicationPath, ...untouchedProjectsPaths].forEach((untouchedProject) => {
      expect(diff.all.some((file) => file.startsWith(path.posix.relative(workspacePath, untouchedProject)))).toBe(false);
    });

    expect(() => packageManagerInstall(execAppOptions)).not.toThrow();
    expect(() => packageManagerRunOnProject(libName, isInWorkspace, { script: 'build' }, execAppOptions)).not.toThrow();
  });
});
