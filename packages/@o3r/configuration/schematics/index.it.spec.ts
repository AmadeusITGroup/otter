/**
 * Test environment exported by O3rEnvironment, must be first line of the file
 * @jest-environment @o3r/test-helpers/jest-environment
 * @jest-environment-o3r-app-folder test-app-configuration
 */
const o3rEnvironment = globalThis.o3rEnvironment;

import * as fs from 'node:fs';
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
    const { applicationPath, workspacePath, appName, libraryPath, isInWorkspace, isYarnTest, untouchedProjectsPaths, o3rVersion } = o3rEnvironment.testEnvironment;
    const execAppOptions = { ...getDefaultExecSyncOptions(), cwd: workspacePath };
    const relativeApplicationPath = path.relative(workspacePath, applicationPath);
    packageManagerExec({ script: 'ng', args: ['add', `@o3r/configuration@${o3rVersion}`, '--skip-confirmation', '--project-name', appName] }, execAppOptions);

    const componentPath = path.normalize(path.posix.join(relativeApplicationPath, 'src/components/test/test.ts'));
    packageManagerExec({ script: 'ng', args: ['g', '@o3r/core:component', 'test', '--project-name', appName, '--use-otter-config', 'false'] }, execAppOptions);
    packageManagerExec({ script: 'ng', args: ['g', '@o3r/configuration:add-config', '--path', componentPath] }, execAppOptions);
    await addImportToAppModule(applicationPath, 'Test', 'src/components/test');

    packageManagerExec({ script: 'ng', args: ['g', '@o3r/core:component', 'test-signal', '--project-name', appName, '--use-otter-config', 'false'] }, execAppOptions);
    packageManagerExec({
      script: 'ng',
      args: ['g', '@o3r/configuration:add-config', '--path', path.join(relativeApplicationPath, 'src/components/test-signal/test-signal.ts'), '--use-signal']
    }, execAppOptions);
    await addImportToAppModule(applicationPath, 'TestSignal', 'src/components/test-signal');

    const diff = getGitDiff(workspacePath);
    expect(diff.added.toSorted()).toEqual([
      path.join(relativeApplicationPath, 'src/components/test-signal/README.md').replace(/[/\\]+/g, '/'),
      path.join(relativeApplicationPath, 'src/components/test-signal/index.ts').replace(/[/\\]+/g, '/'),
      path.join(relativeApplicationPath, 'src/components/test-signal/test-signal.ts').replace(/[/\\]+/g, '/'),
      path.join(relativeApplicationPath, 'src/components/test-signal/test-signal-config.ts').replace(/[/\\]+/g, '/'),
      path.join(relativeApplicationPath, 'src/components/test-signal/test-signal-context.ts').replace(/[/\\]+/g, '/'),
      path.join(relativeApplicationPath, 'src/components/test-signal/test-signal.spec.ts').replace(/[/\\]+/g, '/'),
      path.join(relativeApplicationPath, 'src/components/test-signal/test-signal.scss').replace(/[/\\]+/g, '/'),
      path.join(relativeApplicationPath, 'src/components/test-signal/test-signal.html').replace(/[/\\]+/g, '/'),
      path.join(relativeApplicationPath, 'src/components/test/README.md').replace(/[/\\]+/g, '/'),
      path.join(relativeApplicationPath, 'src/components/test/index.ts').replace(/[/\\]+/g, '/'),
      path.join(relativeApplicationPath, 'src/components/test/test.ts').replace(/[/\\]+/g, '/'),
      path.join(relativeApplicationPath, 'src/components/test/test-config.ts').replace(/[/\\]+/g, '/'),
      path.join(relativeApplicationPath, 'src/components/test/test-context.ts').replace(/[/\\]+/g, '/'),
      path.join(relativeApplicationPath, 'src/components/test/test.spec.ts').replace(/[/\\]+/g, '/'),
      path.join(relativeApplicationPath, 'src/components/test/test.scss').replace(/[/\\]+/g, '/'),
      path.join(relativeApplicationPath, 'src/components/test/test.html').replace(/[/\\]+/g, '/')
    ].toSorted());
    expect(diff.modified.toSorted()).toEqual([
      path.join(relativeApplicationPath, 'package.json').replace(/[/\\]+/g, '/'),
      path.join(relativeApplicationPath, 'src/app/app.ts').replace(/[/\\]+/g, '/'),
      path.join(relativeApplicationPath, 'src/main.ts').replace(/[/\\]+/g, '/'),
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
  test('should add configuration to a library', () => {
    const { workspacePath, untouchedProjectsPaths, isInWorkspace, isYarnTest, applicationPath, libName, libraryPath, o3rVersion } = o3rEnvironment.testEnvironment;
    const execAppOptions = { ...getDefaultExecSyncOptions(), cwd: workspacePath };
    const relativeLibraryPath = path.relative(workspacePath, libraryPath);
    packageManagerExec({ script: 'ng', args: ['add', `@o3r/configuration@${o3rVersion}`, '--skip-confirmation', '--project-name', libName] }, execAppOptions);

    const componentPath = path.normalize(path.posix.join(relativeLibraryPath, 'src/components/test/test.ts'));
    packageManagerExec({ script: 'ng', args: ['g', '@o3r/core:component', 'test', '--project-name', libName, '--use-otter-config', 'false'] }, execAppOptions);
    packageManagerExec({ script: 'ng', args: ['g', '@o3r/configuration:add-config', '--path', componentPath] }, execAppOptions);

    packageManagerExec({ script: 'ng', args: ['g', '@o3r/core:component', 'test-signal', '--project-name', libName, '--use-otter-config', 'false'] }, execAppOptions);
    packageManagerExec({
      script: 'ng',
      args: ['g', '@o3r/configuration:add-config', '--path', path.join(relativeLibraryPath, 'src/components/test-signal/test-signal.ts'), '--use-signal']
    }, execAppOptions);

    const diff = getGitDiff(workspacePath);
    const angularJSON = JSON.parse(fs.readFileSync(`${workspacePath}/angular.json`, 'utf8'));
    expect(angularJSON.schematics['@o3r/core:component']).toBeDefined();
    expect(angularJSON.schematics['@o3r/core:component-container']).toBeDefined();
    expect(angularJSON.schematics['@o3r/core:component-presenter']).toBeDefined();
    expect(angularJSON.cli?.schematicCollections?.indexOf('@o3r/configuration') > -1).toBe(true);

    const packageJson = JSON.parse(fs.readFileSync(`${workspacePath}/package.json`, 'utf8'));
    expect(packageJson.devDependencies['@o3r/configuration']).toBeDefined();
    expect(diff.added.toSorted()).toEqual([
      path.join(relativeLibraryPath, 'src/components/test/test.scss').replace(/[/\\]+/g, '/'),
      path.join(relativeLibraryPath, 'src/components/test/test-context.ts').replace(/[/\\]+/g, '/'),
      path.join(relativeLibraryPath, 'src/components/test/test.html').replace(/[/\\]+/g, '/'),
      path.join(relativeLibraryPath, 'src/components/test/test.spec.ts').replace(/[/\\]+/g, '/'),
      path.join(relativeLibraryPath, 'src/components/test/test.ts').replace(/[/\\]+/g, '/'),
      path.join(relativeLibraryPath, 'src/components/test/test-config.ts').replace(/[/\\]+/g, '/'),
      path.join(relativeLibraryPath, 'src/components/test/index.ts').replace(/[/\\]+/g, '/'),
      path.join(relativeLibraryPath, 'src/components/test/README.md').replace(/[/\\]+/g, '/'),
      path.join(relativeLibraryPath, 'src/components/test-signal/test-signal.scss').replace(/[/\\]+/g, '/'),
      path.join(relativeLibraryPath, 'src/components/test-signal/test-signal-context.ts').replace(/[/\\]+/g, '/'),
      path.join(relativeLibraryPath, 'src/components/test-signal/test-signal.html').replace(/[/\\]+/g, '/'),
      path.join(relativeLibraryPath, 'src/components/test-signal/test-signal.spec.ts').replace(/[/\\]+/g, '/'),
      path.join(relativeLibraryPath, 'src/components/test-signal/test-signal.ts').replace(/[/\\]+/g, '/'),
      path.join(relativeLibraryPath, 'src/components/test-signal/test-signal-config.ts').replace(/[/\\]+/g, '/'),
      path.join(relativeLibraryPath, 'src/components/test-signal/index.ts').replace(/[/\\]+/g, '/'),
      path.join(relativeLibraryPath, 'src/components/test-signal/README.md').replace(/[/\\]+/g, '/')
    ].toSorted());
    expect(diff.modified.toSorted()).toEqual([
      path.join(relativeLibraryPath, 'package.json').replace(/[/\\]+/g, '/'),
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
