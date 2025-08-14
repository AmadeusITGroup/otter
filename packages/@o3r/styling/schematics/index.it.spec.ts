/**
 * Test environment exported by O3rEnvironment, must be first line of the file
 * @jest-environment @o3r/test-helpers/jest-environment
 * @jest-environment-o3r-app-folder test-app-styling
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

describe('ng add styling', () => {
  test('should add styling to an application', async () => {
    const { applicationPath, workspacePath, appName, isInWorkspace, o3rVersion, untouchedProjectsPaths, libraryPath, isYarnTest } = o3rEnvironment.testEnvironment;
    const execAppOptions = { ...getDefaultExecSyncOptions(), cwd: workspacePath };
    const relativeApplicationPath = path.relative(workspacePath, applicationPath);
    expect(() => packageManagerExec({ script: 'ng', args: ['add', `@o3r/styling@${o3rVersion}`,
      '--enable-metadata-extract', '--skip-confirmation', '--project-name', appName] }, execAppOptions)).not.toThrow();

    packageManagerExec({ script: 'ng', args: ['g', '@o3r/core:component', '--defaults', 'true', 'test', '--use-otter-theming', 'false', '--project-name', appName] }, execAppOptions);
    const filePath = path.normalize(path.posix.join(relativeApplicationPath, 'src/components/test/test.style.scss'));
    packageManagerExec({ script: 'ng', args: ['g', '@o3r/styling:add-theming', '--path', filePath] }, execAppOptions);
    await addImportToAppModule(applicationPath, 'TestComponent', 'src/components/test');

    const diff = getGitDiff(execAppOptions.cwd);
    const expectedAddedFiles = [
      path.join(relativeApplicationPath, 'src/components/test/test.style.theme.scss').replace(/[/\\]+/g, '/'),
      'apps/test-app/migration-scripts/README.md'
    ];
    expectedAddedFiles.forEach((file) => expect(diff.added).toContain(file));
    expect(diff.added).toBe(expectedAddedFiles.length + 15); // TODO define what are the remaining added files
    expect(diff.modified).toEqual([
      path.join(relativeApplicationPath, '.gitignore').replace(/[/\\]+/g, '/'),
      path.join(relativeApplicationPath, 'package.json').replace(/[/\\]+/g, '/'),
      '.gitignore',
      'angular.json',
      'package.json',
      isYarnTest ? 'yarn.lock' : 'package-lock.json'
    ]);

    [libraryPath, ...untouchedProjectsPaths].forEach((untouchedProject) => {
      expect(diff.all.some((file) => file.startsWith(path.relative(workspacePath, untouchedProject).replace(/\\+/g, '/')))).toBe(false);
    });

    expect(() => packageManagerInstall(execAppOptions)).not.toThrow();
    expect(() => packageManagerRunOnProject(appName, isInWorkspace, { script: 'build' }, execAppOptions)).not.toThrow();
  });

  test('should add styling to a library', () => {
    const { applicationPath, workspacePath, libName, isInWorkspace, isYarnTest, o3rVersion, libraryPath, untouchedProjectsPaths } = o3rEnvironment.testEnvironment;
    const execAppOptions = { ...getDefaultExecSyncOptions(), cwd: workspacePath };
    const relativeLibraryPath = path.relative(workspacePath, libraryPath);
    expect(() => packageManagerExec({ script: 'ng', args: ['add', `@o3r/styling@${o3rVersion}`,
      '--enable-metadata-extract', '--skip-confirmation', '--project-name', libName] }, execAppOptions)).not.toThrow();

    packageManagerExec({ script: 'ng', args: ['g', '@o3r/core:component', '--defaults', 'true', 'test', '--use-otter-theming', 'false', '--project-name', libName] }, execAppOptions);
    const filePath = path.normalize(path.posix.join(relativeLibraryPath, 'src/components/test/test.style.scss'));
    packageManagerExec({ script: 'ng', args: ['g', '@o3r/styling:add-theming', '--path', filePath] }, execAppOptions);

    const diff = getGitDiff(execAppOptions.cwd);
    expect(diff.added).toEqual([
      path.join(relativeLibraryPath, 'src/components/test/test.style.theme.scss').replace(/[/\\]+/g, '/'),
      path.join(relativeLibraryPath, 'src/components/test/test.style.scss').replace(/[/\\]+/g, '/'),
      path.join(relativeLibraryPath, 'src/components/test/test.module.ts').replace(/[/\\]+/g, '/'),
      path.join(relativeLibraryPath, 'src/components/test/test.context.ts').replace(/[/\\]+/g, '/'),
      path.join(relativeLibraryPath, 'src/components/test/test.template.html').replace(/[/\\]+/g, '/'),
      path.join(relativeLibraryPath, 'src/components/test/test.spec.ts').replace(/[/\\]+/g, '/'),
      path.join(relativeLibraryPath, 'src/components/test/test.component.ts').replace(/[/\\]+/g, '/'),
      path.join(relativeLibraryPath, 'src/components/test/index.ts').replace(/[/\\]+/g, '/'),
      path.join(relativeLibraryPath, 'src/components/test/README.md').replace(/[/\\]+/g, '/')
    ]);
    expect(diff.added).toContain(path.join(relativeLibraryPath, 'src/components/test/test.style.theme.scss').replace(/[/\\]+/g, '/'));

    expect(diff.modified).toEqual([
      path.join(relativeLibraryPath, '.gitignore').replace(/[/\\]+/g, '/'),
      path.join(relativeLibraryPath, 'package.json').replace(/[/\\]+/g, '/'),
      '.gitignore',
      'angular.json',
      'package.json',
      isYarnTest ? 'yarn.lock' : 'package-lock.json'
    ]);

    [applicationPath, ...untouchedProjectsPaths].forEach((untouchedProject) => {
      expect(diff.all.some((file) => file.startsWith(path.relative(workspacePath, untouchedProject).replace(/\\+/g, '/')))).toBe(false);
    });

    expect(() => packageManagerInstall(execAppOptions)).not.toThrow();
    expect(() => packageManagerRunOnProject(libName, isInWorkspace, { script: 'build' }, execAppOptions)).not.toThrow();
  });
});
