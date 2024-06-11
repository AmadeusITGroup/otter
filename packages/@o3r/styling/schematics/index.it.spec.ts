/**
 * Test environment exported by O3rEnvironment, must be first line of the file
 * @jest-environment @o3r/test-helpers/jest-environment
 * @jest-environment-o3r-app-folder test-app-styling
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

describe('ng add styling', () => {
  test('should add styling to an application', async () => {
    const { applicationPath, workspacePath, appName, isInWorkspace, o3rVersion, untouchedProjectsPaths, libraryPath } = o3rEnvironment.testEnvironment;
    const execAppOptions = {...getDefaultExecSyncOptions(), cwd: workspacePath};
    const relativeApplicationPath = path.relative(workspacePath, applicationPath);
    expect(() => packageManagerExec({script: 'ng', args: ['add', `@o3r/styling@${o3rVersion}`,
      '--enable-metadata-extract', '--skip-confirmation', '--project-name', appName]}, execAppOptions)).not.toThrow();

    packageManagerExec({script: 'ng', args: ['g', '@o3r/core:component', '--defaults', 'true', 'test-component', '--use-otter-theming', 'false', '--project-name', appName]}, execAppOptions);
    const filePath = path.normalize(path.posix.join(relativeApplicationPath, 'src/components/test-component/test-component.style.scss'));
    packageManagerExec({script: 'ng', args: ['g', '@o3r/styling:add-theming', '--path', filePath]}, execAppOptions);
    await addImportToAppModule(applicationPath, 'TestComponentModule', 'src/components/test-component');

    const diff = getGitDiff(execAppOptions.cwd);
    expect(diff.added.length).toBe(17);
    expect(diff.added).toContain(path.join(relativeApplicationPath, 'src/components/test-component/test-component.style.theme.scss').replace(/[\\/]+/g, '/'));

    expect(diff.modified.length).toBe(6);

    [libraryPath, ...untouchedProjectsPaths].forEach(untouchedProject => {
      expect(diff.all.some(file => file.startsWith(path.posix.relative(workspacePath, untouchedProject)))).toBe(false);
    });

    expect(() => packageManagerInstall(execAppOptions)).not.toThrow();
    expect(() => packageManagerRunOnProject(appName, isInWorkspace, {script: 'build'}, execAppOptions)).not.toThrow();
  });

  test('should add styling to a library', () => {
    const { applicationPath, workspacePath, libName, isInWorkspace, o3rVersion, libraryPath, untouchedProjectsPaths } = o3rEnvironment.testEnvironment;
    const execAppOptions = {...getDefaultExecSyncOptions(), cwd: workspacePath};
    const relativeLibraryPath = path.relative(workspacePath, libraryPath);
    expect(() => packageManagerExec({script: 'ng', args: ['add', `@o3r/styling@${o3rVersion}`,
      '--enable-metadata-extract', '--skip-confirmation', '--project-name', libName]}, execAppOptions)).not.toThrow();

    packageManagerExec({script: 'ng', args: ['g', '@o3r/core:component', '--defaults', 'true', 'test-component', '--use-otter-theming', 'false', '--project-name', libName]}, execAppOptions);
    const filePath = path.normalize(path.posix.join(relativeLibraryPath, 'src/components/test-component/test-component.style.scss'));
    packageManagerExec({script: 'ng', args: ['g', '@o3r/styling:add-theming', '--path', filePath]}, execAppOptions);

    const diff = getGitDiff(execAppOptions.cwd);
    expect(diff.added.length).toBe(13);
    expect(diff.added).toContain(path.join(relativeLibraryPath, 'src/components/test-component/test-component.style.theme.scss').replace(/[\\/]+/g, '/'));

    expect(diff.modified.length).toBe(4);

    [applicationPath, ...untouchedProjectsPaths].forEach(untouchedProject => {
      expect(diff.all.some(file => file.startsWith(path.posix.relative(workspacePath, untouchedProject)))).toBe(false);
    });

    expect(() => packageManagerInstall(execAppOptions)).not.toThrow();
    expect(() => packageManagerRunOnProject(libName, isInWorkspace, {script: 'build'}, execAppOptions)).not.toThrow();
  });
});
