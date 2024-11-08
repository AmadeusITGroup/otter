/**
 * Test environment exported by O3rEnvironment, must be first line of the file
 * @jest-environment @o3r/test-helpers/jest-environment
 * @jest-environment-o3r-app-folder test-app-configuration
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

describe('new otter application with configuration', () => {
  test('should add configuration to an application', async () => {
    const { applicationPath, workspacePath, appName, libraryPath, isInWorkspace, untouchedProjectsPaths, o3rVersion } = o3rEnvironment.testEnvironment;
    const execAppOptions = { ...getDefaultExecSyncOptions(), cwd: workspacePath };
    const relativeApplicationPath = path.relative(workspacePath, applicationPath);
    packageManagerExec({ script: 'ng', args: ['add', `@o3r/configuration@${o3rVersion}`, '--skip-confirmation', '--project-name', appName] }, execAppOptions);

    const componentPath = path.normalize(path.posix.join(relativeApplicationPath, 'src/components/test-component/test-component.component.ts'));
    packageManagerExec({ script: 'ng', args: ['g', '@o3r/core:component', 'test-component', '--project-name', appName, '--use-otter-config', 'false'] }, execAppOptions);
    packageManagerExec({ script: 'ng', args: ['g', '@o3r/configuration:add-config', '--path', componentPath] }, execAppOptions);
    await addImportToAppModule(applicationPath, 'TestComponentModule', 'src/components/test-component');

    packageManagerExec({ script: 'ng', args: ['g', '@o3r/core:component', 'test-signal', '--project-name', appName, '--use-otter-config', 'false'] }, execAppOptions);
    packageManagerExec({
      script: 'ng',
      args: ['g', '@o3r/configuration:add-config', '--path', path.join(relativeApplicationPath, 'src/components/test-signal/test-signal.component.ts'), '--use-signal']
    }, execAppOptions);
    await addImportToAppModule(applicationPath, 'TestSignalModule', 'src/components/test-signal');

    const diff = getGitDiff(workspacePath);
    expect(diff.added.length).toEqual(20);
    expect(diff.modified.length).toEqual(6);
    expect(diff.modified).toContain('package.json');
    expect(diff.added).toContain(path.posix.join(relativeApplicationPath, 'src/components/test-component/test-component.config.ts').replace(/[/\\]+/g, '/'));
    expect(diff.added).toContain(path.posix.join(relativeApplicationPath, 'src/components/test-signal/test-signal.config.ts').replace(/[/\\]+/g, '/'));

    [libraryPath, ...untouchedProjectsPaths].forEach((untouchedProject) => {
      expect(diff.all.some((file) => file.startsWith(path.posix.relative(workspacePath, untouchedProject)))).toBe(false);
    });

    expect(() => packageManagerInstall(execAppOptions)).not.toThrow();
    expect(() => packageManagerRunOnProject(appName, isInWorkspace, { script: 'build' }, execAppOptions)).not.toThrow();
  });
  test('should add configuration to a library', () => {
    const { applicationPath, workspacePath, libName, libraryPath, isInWorkspace, untouchedProjectsPaths, o3rVersion } = o3rEnvironment.testEnvironment;
    const execAppOptions = { ...getDefaultExecSyncOptions(), cwd: workspacePath };
    const relativeLibraryPath = path.relative(workspacePath, libraryPath);
    packageManagerExec({ script: 'ng', args: ['add', `@o3r/configuration@${o3rVersion}`, '--skip-confirmation', '--project-name', libName] }, execAppOptions);

    const componentPath = path.normalize(path.posix.join(relativeLibraryPath, 'src/components/test-component/test-component.component.ts'));
    packageManagerExec({ script: 'ng', args: ['g', '@o3r/core:component', 'test-component', '--project-name', libName, '--use-otter-config', 'false'] }, execAppOptions);
    packageManagerExec({ script: 'ng', args: ['g', '@o3r/configuration:add-config', '--path', componentPath] }, execAppOptions);

    packageManagerExec({ script: 'ng', args: ['g', '@o3r/core:component', 'test-signal', '--project-name', libName, '--use-otter-config', 'false'] }, execAppOptions);
    packageManagerExec({
      script: 'ng',
      args: ['g', '@o3r/configuration:add-config', '--path', path.join(relativeLibraryPath, 'src/components/test-signal/test-signal.component.ts'), '--use-signal']
    }, execAppOptions);

    const diff = getGitDiff(workspacePath);
    expect(diff.added.length).toEqual(20);
    expect(diff.modified.length).toEqual(7);
    expect(diff.modified).toContain('package.json');
    expect(diff.added).toContain(path.posix.join(relativeLibraryPath, 'src/components/test-component/test-component.config.ts').replace(/[/\\]+/g, '/'));
    expect(diff.added).toContain(path.posix.join(relativeLibraryPath, 'src/components/test-signal/test-signal.config.ts').replace(/[/\\]+/g, '/'));

    [applicationPath, ...untouchedProjectsPaths].forEach((untouchedProject) => {
      expect(diff.all.some((file) => file.startsWith(path.posix.relative(workspacePath, untouchedProject)))).toBe(false);
    });

    expect(() => packageManagerInstall(execAppOptions)).not.toThrow();
    expect(() => packageManagerRunOnProject(libName, isInWorkspace, { script: 'build' }, execAppOptions)).not.toThrow();
  });
});
