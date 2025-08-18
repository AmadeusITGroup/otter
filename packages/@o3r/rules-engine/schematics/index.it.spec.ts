/**
 * Test environment exported by O3rEnvironment, must be first line of the file
 * @jest-environment @o3r/test-helpers/jest-environment
 * @jest-environment-o3r-app-folder test-app-rules-engine
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

describe('ng add rules-engine', () => {
  test('should add rules engine to an application', async () => {
    const { applicationPath, workspacePath, appName, isInWorkspace, isYarnTest, untouchedProjectsPaths, o3rVersion, libraryPath } = o3rEnvironment.testEnvironment;
    const execAppOptions = { ...getDefaultExecSyncOptions(), cwd: workspacePath };
    const relativeApplicationPath = path.relative(workspacePath, applicationPath);
    expect(() => packageManagerExec({ script: 'ng', args: ['add', `@o3r/rules-engine@${o3rVersion}`,
      '--enable-metadata-extract', '--project-name', appName, '--skip-confirmation'] }, execAppOptions)).not.toThrow();
    const componentPath = path.normalize(path.posix.join(relativeApplicationPath, 'src/components/test/test.component.ts'));
    packageManagerExec({ script: 'ng', args: ['g', '@o3r/core:component', 'test', '--activate-dummy', '--use-rules-engine', 'false', '--project-name', appName] }, execAppOptions);
    packageManagerExec({ script: 'ng', args: ['g', '@o3r/rules-engine:rules-engine-to-component', '--path', componentPath] }, execAppOptions);
    await addImportToAppModule(applicationPath, 'TestComponent', 'src/components/test');

    const diff = getGitDiff(workspacePath);
    const expectedAddedFiles = [
      path.join(relativeApplicationPath, 'src/components/test/README.md').replace(/[/\\]+/g, '/'),
      path.join(relativeApplicationPath, 'src/components/test/index.ts').replace(/[/\\]+/g, '/'),
      path.join(relativeApplicationPath, 'src/components/test/test.component.ts').replace(/[/\\]+/g, '/'),
      path.join(relativeApplicationPath, 'src/components/test/test.context.ts').replace(/[/\\]+/g, '/'),
      path.join(relativeApplicationPath, 'src/components/test/test.spec.ts').replace(/[/\\]+/g, '/'),
      path.join(relativeApplicationPath, 'src/components/test/test.style.scss').replace(/[/\\]+/g, '/'),
      path.join(relativeApplicationPath, 'src/components/test/test.template.html').replace(/[/\\]+/g, '/'),
      path.join(relativeApplicationPath, 'migration-scripts/README.md').replace(/[/\\]+/g, '/'),
      path.join(relativeApplicationPath, 'cms.json').replace(/[/\\]+/g, '/'),
      path.join(relativeApplicationPath, 'placeholders.metadata.json').replace(/[/\\]+/g, '/'),
      path.join(relativeApplicationPath, 'tsconfig.cms.json').replace(/[/\\]+/g, '/')
    ];
    expect(diff.added.sort()).toEqual(expectedAddedFiles.sort());
    const expectedModifiedFiles = [
      path.join(relativeApplicationPath, 'package.json').replace(/[/\\]+/g, '/'),
      path.join(relativeApplicationPath, 'src/app/app.ts').replace(/[/\\]+/g, '/'),
      path.join(relativeApplicationPath, 'src/app/app.config.ts').replace(/[/\\]+/g, '/'),
      path.join(relativeApplicationPath, 'src/main.ts').replace(/[/\\]+/g, '/'),
      '.gitignore',
      'angular.json',
      'package.json',
      isYarnTest ? 'yarn.lock' : 'package-lock.json'
    ];
    expect(diff.modified.sort()).toEqual(expectedModifiedFiles.sort());
    [libraryPath, ...untouchedProjectsPaths].forEach((untouchedProject) => {
      expect(diff.all.some((file) => file.startsWith(path.relative(workspacePath, untouchedProject).replace(/\\+/g, '/')))).toBe(false);
    });

    expect(() => packageManagerInstall(execAppOptions)).not.toThrow();
    expect(() => packageManagerRunOnProject(appName, isInWorkspace, { script: 'build' }, execAppOptions)).not.toThrow();
  });
  test('should add rules engine to a library', () => {
    const { applicationPath, workspacePath, isInWorkspace, isYarnTest, o3rVersion, libraryPath, libName, untouchedProjectsPaths } = o3rEnvironment.testEnvironment;
    const execAppOptions = { ...getDefaultExecSyncOptions(), cwd: workspacePath };
    const relativeLibraryPath = path.relative(workspacePath, libraryPath);
    expect(() => packageManagerExec({ script: 'ng', args: ['add', `@o3r/rules-engine@${o3rVersion}`,
      '--enable-metadata-extract', '--project-name', libName, '--skip-confirmation'] }, execAppOptions)).not.toThrow();
    const componentPath = path.normalize(path.posix.join(relativeLibraryPath, 'src/components/test/test.component.ts'));
    packageManagerExec({ script: 'ng', args: ['g', '@o3r/core:component', 'test', '--activate-dummy', '--use-rules-engine', 'false', '--project-name', libName] }, execAppOptions);
    packageManagerExec({ script: 'ng', args: ['g', '@o3r/rules-engine:rules-engine-to-component', '--path', componentPath] }, execAppOptions);

    const diff = getGitDiff(workspacePath);
    expect(diff.added.sort()).toEqual([
      path.join(relativeLibraryPath, 'src/components/test/test.style.scss').replace(/[/\\]+/g, '/'),
      path.join(relativeLibraryPath, 'src/components/test/test.context.ts').replace(/[/\\]+/g, '/'),
      path.join(relativeLibraryPath, 'src/components/test/test.template.html').replace(/[/\\]+/g, '/'),
      path.join(relativeLibraryPath, 'src/components/test/test.spec.ts').replace(/[/\\]+/g, '/'),
      path.join(relativeLibraryPath, 'src/components/test/test.component.ts').replace(/[/\\]+/g, '/'),
      path.join(relativeLibraryPath, 'src/components/test/index.ts').replace(/[/\\]+/g, '/'),
      path.join(relativeLibraryPath, 'src/components/test/README.md').replace(/[/\\]+/g, '/'),
      path.join(relativeLibraryPath, 'migration-scripts/README.md').replace(/[/\\]+/g, '/'),
      path.join(relativeLibraryPath, 'cms.json').replace(/[/\\]+/g, '/'),
      path.join(relativeLibraryPath, 'placeholders.metadata.json').replace(/[/\\]+/g, '/'),
      path.join(relativeLibraryPath, 'tsconfig.cms.json').replace(/[/\\]+/g, '/')
    ].sort());
    expect(diff.modified.sort()).toEqual([
      path.join(relativeLibraryPath, 'package.json').replace(/[/\\]+/g, '/'),
      '.gitignore',
      'angular.json',
      'package.json',
      isYarnTest ? 'yarn.lock' : 'package-lock.json'
    ].sort());

    [applicationPath, ...untouchedProjectsPaths].forEach((untouchedProject) => {
      expect(diff.all.some((file) => file.startsWith(path.relative(workspacePath, untouchedProject).replace(/\\+/g, '/')))).toBe(false);
    });

    expect(() => packageManagerInstall(execAppOptions)).not.toThrow();
    expect(() => packageManagerRunOnProject(libName, isInWorkspace, { script: 'build' }, execAppOptions)).not.toThrow();
  });
});
