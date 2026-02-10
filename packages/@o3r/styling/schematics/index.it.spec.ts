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

    packageManagerExec({ script: 'ng', args: ['g', '@o3r/core:component', '--defaults', 'true', 'test', '--project-name', appName] }, execAppOptions);
    const filePath = path.normalize(path.posix.join(relativeApplicationPath, 'src/components/test/test.scss'));
    packageManagerExec({ script: 'ng', args: ['g', '@o3r/styling:add-theming', '--path', filePath] }, execAppOptions);
    await addImportToAppModule(applicationPath, 'Test', 'src/components/test');

    const diff = getGitDiff(execAppOptions.cwd);
    const expectedAddedFiles = [
      path.join(relativeApplicationPath, 'src/components/test/README.md').replace(/[/\\]+/g, '/'),
      path.join(relativeApplicationPath, 'src/components/test/index.ts').replace(/[/\\]+/g, '/'),
      path.join(relativeApplicationPath, 'src/components/test/test.ts').replace(/[/\\]+/g, '/'),
      path.join(relativeApplicationPath, 'src/components/test/test-context.ts').replace(/[/\\]+/g, '/'),
      path.join(relativeApplicationPath, 'src/components/test/test.spec.ts').replace(/[/\\]+/g, '/'),
      path.join(relativeApplicationPath, 'src/components/test/test.scss').replace(/[/\\]+/g, '/'),
      path.join(relativeApplicationPath, 'src/components/test/test-theme.scss').replace(/[/\\]+/g, '/'),
      path.join(relativeApplicationPath, 'src/components/test/test.html').replace(/[/\\]+/g, '/'),
      path.join(relativeApplicationPath, 'src/styling/_component-styling-override.scss').replace(/[/\\]+/g, '/'),
      path.join(relativeApplicationPath, 'src/styling/_component-variable-override.scss').replace(/[/\\]+/g, '/'),
      path.join(relativeApplicationPath, 'src/styling/_theme.scss').replace(/[/\\]+/g, '/'),
      path.join(relativeApplicationPath, 'src/styling/global-styles.scss').replace(/[/\\]+/g, '/'),
      path.join(relativeApplicationPath, 'migration-scripts/README.md').replace(/[/\\]+/g, '/'),
      path.join(relativeApplicationPath, 'placeholders.metadata.json').replace(/[/\\]+/g, '/'),
      path.join(relativeApplicationPath, 'tsconfig.cms.json').replace(/[/\\]+/g, '/')
    ].toSorted();
    expect(diff.added.toSorted()).toEqual(expectedAddedFiles);
    expect(diff.modified.toSorted()).toEqual([
      path.join(relativeApplicationPath, 'package.json').replace(/[/\\]+/g, '/'),
      path.join(relativeApplicationPath, 'src/app/app.ts').replace(/[/\\]+/g, '/'),
      path.join(relativeApplicationPath, 'src/styles.scss').replace(/[/\\]+/g, '/'),
      '.gitignore',
      'angular.json',
      'package.json',
      isYarnTest ? 'yarn.lock' : 'package-lock.json'
    ].toSorted());

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

    packageManagerExec({ script: 'ng', args: ['g', '@o3r/core:component', '--defaults', 'true', 'test', '--project-name', libName] }, execAppOptions);
    const filePath = path.normalize(path.posix.join(relativeLibraryPath, 'src/components/test/test.scss'));
    packageManagerExec({ script: 'ng', args: ['g', '@o3r/styling:add-theming', '--path', filePath] }, execAppOptions);

    const diff = getGitDiff(execAppOptions.cwd);
    expect(diff.added.toSorted()).toEqual([
      path.join(relativeLibraryPath, 'src/components/test/test-theme.scss').replace(/[/\\]+/g, '/'),
      path.join(relativeLibraryPath, 'src/components/test/test.scss').replace(/[/\\]+/g, '/'),
      path.join(relativeLibraryPath, 'src/components/test/test-context.ts').replace(/[/\\]+/g, '/'),
      path.join(relativeLibraryPath, 'src/components/test/test.html').replace(/[/\\]+/g, '/'),
      path.join(relativeLibraryPath, 'src/components/test/test.spec.ts').replace(/[/\\]+/g, '/'),
      path.join(relativeLibraryPath, 'src/components/test/test.ts').replace(/[/\\]+/g, '/'),
      path.join(relativeLibraryPath, 'src/components/test/index.ts').replace(/[/\\]+/g, '/'),
      path.join(relativeLibraryPath, 'src/components/test/README.md').replace(/[/\\]+/g, '/'),
      path.join(relativeLibraryPath, 'migration-scripts/README.md').replace(/[/\\]+/g, '/'),
      path.join(relativeLibraryPath, 'placeholders.metadata.json').replace(/[/\\]+/g, '/'),
      path.join(relativeLibraryPath, 'tsconfig.cms.json').replace(/[/\\]+/g, '/')
    ].toSorted());

    expect(diff.modified.toSorted()).toEqual([
      path.join(relativeLibraryPath, 'package.json').replace(/[/\\]+/g, '/'),
      '.gitignore',
      'angular.json',
      'package.json',
      isYarnTest ? 'yarn.lock' : 'package-lock.json'
    ].toSorted());

    [applicationPath, ...untouchedProjectsPaths].forEach((untouchedProject) => {
      expect(diff.all.some((file) => file.startsWith(path.relative(workspacePath, untouchedProject).replace(/\\+/g, '/')))).toBe(false);
    });

    expect(() => packageManagerInstall(execAppOptions)).not.toThrow();
    expect(() => packageManagerRunOnProject(libName, isInWorkspace, { script: 'build' }, execAppOptions)).not.toThrow();
  });
});
