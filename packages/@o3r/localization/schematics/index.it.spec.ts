/**
 * Test environment exported by O3rEnvironment, must be first line of the file
 * @jest-environment @o3r/test-helpers/jest-environment
 * @jest-environment-o3r-app-folder test-app-localization
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

describe('ng add otter localization', () => {
  test('should add localization to an application', async () => {
    const { applicationPath, workspacePath, appName, isInWorkspace, isYarnTest, o3rVersion, libraryPath, untouchedProjectsPaths } = o3rEnvironment.testEnvironment;
    const execAppOptions = { ...getDefaultExecSyncOptions(), cwd: workspacePath };
    const relativeApplicationPath = path.relative(workspacePath, applicationPath);
    expect(() => packageManagerExec({ script: 'ng', args: ['add', `@o3r/localization@${o3rVersion}`, '--skip-confirmation', '--project-name', appName] }, execAppOptions)).not.toThrow();

    const componentPath = path.normalize(path.posix.join(relativeApplicationPath, 'src/components/test/test.ts'));
    packageManagerExec({ script: 'ng', args: ['g', '@o3r/core:component', 'test', '--project-name', appName, '--use-localization', 'false'] }, execAppOptions);
    packageManagerExec({ script: 'ng', args: ['g', '@o3r/localization:add-localization', '--activate-dummy', '--path', componentPath] }, execAppOptions);
    await addImportToAppModule(applicationPath, 'Test', 'src/components/test');

    const diff = getGitDiff(workspacePath);

    const modifiedFiles = [
      isYarnTest ? 'yarn.lock' : 'package-lock.json',
      'package.json',
      'angular.json',
      '.gitignore',
      path.join(relativeApplicationPath, 'package.json').replace(/[/\\]+/g, '/'),
      path.join(relativeApplicationPath, 'src/app/app.config.ts').replace(/[/\\]+/g, '/'),
      path.join(relativeApplicationPath, 'src/app/app.spec.ts').replace(/[/\\]+/g, '/'),
      path.join(relativeApplicationPath, 'src/app/app.ts').replace(/[/\\]+/g, '/'),
      path.join(relativeApplicationPath, 'src/main.ts').replace(/[/\\]+/g, '/')
    ].sort();
    expect(diff.modified.sort()).toEqual(modifiedFiles);

    const newFiles = [
      path.join(relativeApplicationPath, 'src/components/test/test-translation.ts').replace(/[/\\]+/g, '/'),
      path.join(relativeApplicationPath, 'src/components/test/test.scss').replace(/[/\\]+/g, '/'),
      path.join(relativeApplicationPath, 'src/components/test/test-context.ts').replace(/[/\\]+/g, '/'),
      path.join(relativeApplicationPath, 'src/components/test/test.html').replace(/[/\\]+/g, '/'),
      path.join(relativeApplicationPath, 'src/components/test/test.spec.ts').replace(/[/\\]+/g, '/'),
      path.join(relativeApplicationPath, 'src/components/test/test-localization.json').replace(/[/\\]+/g, '/'),
      path.join(relativeApplicationPath, 'src/components/test/test.ts').replace(/[/\\]+/g, '/'),
      path.join(relativeApplicationPath, 'src/components/test/index.ts').replace(/[/\\]+/g, '/'),
      path.join(relativeApplicationPath, 'src/components/test/README.md').replace(/[/\\]+/g, '/'),
      path.join(relativeApplicationPath, 'src/assets/locales/.gitkeep').replace(/[/\\]+/g, '/'),
      path.join(relativeApplicationPath, 'migration-scripts/README.md').replace(/[/\\]+/g, '/'),
      path.join(relativeApplicationPath, 'tsconfig.cms.json').replace(/[/\\]+/g, '/'),
      path.join(relativeApplicationPath, '.gitignore').replace(/[/\\]+/g, '/')
    ].sort();
    expect(diff.added.sort()).toEqual(newFiles);

    [libraryPath, ...untouchedProjectsPaths].forEach((untouchedProject) => {
      expect(diff.all.some((file) => file.startsWith(path.relative(workspacePath, untouchedProject).replace(/\\+/g, '/')))).toBe(false);
    });

    expect(() => packageManagerInstall(execAppOptions)).not.toThrow();
    expect(() => packageManagerRunOnProject(appName, isInWorkspace, { script: 'build' }, execAppOptions)).not.toThrow();
  });

  test('should add localization to a library', () => {
    const { workspacePath, isInWorkspace, untouchedProjectsPaths, o3rVersion, libraryPath, libName, applicationPath, isYarnTest } = o3rEnvironment.testEnvironment;
    const execAppOptions = { ...getDefaultExecSyncOptions(), cwd: workspacePath };
    const relativeLibraryPath = path.relative(workspacePath, libraryPath);
    expect(() => packageManagerExec({ script: 'ng', args: ['add', `@o3r/localization@${o3rVersion}`, '--skip-confirmation', '--project-name', libName] }, execAppOptions)).not.toThrow();

    const componentPath = path.normalize(path.posix.join(relativeLibraryPath, 'src/components/test/test.ts'));
    packageManagerExec({ script: 'ng', args: ['g', '@o3r/core:component', 'test', '--project-name', libName, '--use-localization', 'false'] }, execAppOptions);
    packageManagerExec({ script: 'ng', args: ['g', '@o3r/localization:add-localization', '--activate-dummy', '--path', componentPath] }, execAppOptions);

    const diff = getGitDiff(workspacePath);
    const modifiedFiles = [
      path.join(relativeLibraryPath, '.gitignore').replace(/[/\\]+/g, '/'),
      path.join(relativeLibraryPath, 'package.json').replace(/[/\\]+/g, '/'),
      '.gitignore',
      'angular.json',
      'package.json',
      isYarnTest ? 'yarn.lock' : 'package-lock.json'
    ].sort();
    expect(diff.modified.sort()).toEqual(modifiedFiles);

    const addedFiles = [
      path.join(relativeLibraryPath, 'src/components/test/test-translation.ts').replace(/[/\\]+/g, '/'),
      path.join(relativeLibraryPath, 'src/components/test/test.scss').replace(/[/\\]+/g, '/'),
      path.join(relativeLibraryPath, 'src/components/test/test-context.ts').replace(/[/\\]+/g, '/'),
      path.join(relativeLibraryPath, 'src/components/test/test.html').replace(/[/\\]+/g, '/'),
      path.join(relativeLibraryPath, 'src/components/test/test.spec.ts').replace(/[/\\]+/g, '/'),
      path.join(relativeLibraryPath, 'src/components/test/test-localization.json').replace(/[/\\]+/g, '/'),
      path.join(relativeLibraryPath, 'src/components/test/test.ts').replace(/[/\\]+/g, '/'),
      path.join(relativeLibraryPath, 'src/components/test/index.ts').replace(/[/\\]+/g, '/'),
      path.join(relativeLibraryPath, 'src/components/test/README.md').replace(/[/\\]+/g, '/'),
      path.join(relativeLibraryPath, 'migration-scripts/README.md').replace(/[/\\]+/g, '/'),
      path.join(relativeLibraryPath, 'tsconfig.cms.json').replace(/[/\\]+/g, '/')
    ].sort();
    expect(diff.added.sort()).toEqual(addedFiles);

    [applicationPath, ...untouchedProjectsPaths].forEach((untouchedProject) => {
      expect(diff.all.some((file) => file.startsWith(path.relative(workspacePath, untouchedProject).replace(/\\+/g, '/')))).toBe(false);
    });

    expect(() => packageManagerInstall(execAppOptions)).not.toThrow();
    expect(() => packageManagerRunOnProject(libName, isInWorkspace, { script: 'build' }, execAppOptions)).not.toThrow();
  });
});
