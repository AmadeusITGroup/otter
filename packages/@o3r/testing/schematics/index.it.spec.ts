/**
 * Test environment exported by O3rEnvironment, must be first line of the file
 * @jest-environment @o3r/test-helpers/jest-environment
 * @jest-environment-o3r-app-folder test-app-testing
 */
const o3rEnvironment = globalThis.o3rEnvironment;
import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  addImportToAppModule,
  getDefaultExecSyncOptions,
  getGitDiff,
  packageManagerExec,
  packageManagerExecOnProject,
  packageManagerInstall,
  packageManagerRunOnProject,
} from '@o3r/test-helpers';

describe('ng add testing', () => {
  test('should add testing to an application', () => {
    const { workspacePath, appName, isInWorkspace, o3rVersion, libraryPath, untouchedProjectsPaths, applicationPath } = o3rEnvironment.testEnvironment;
    const execAppOptions = { ...getDefaultExecSyncOptions(), cwd: workspacePath };
    packageManagerExec({ script: 'ng', args: ['add', `@o3r/testing@${o3rVersion}`, '--testing-framework', 'jest', '--skip-confirmation', '--project-name', appName] }, execAppOptions);
    const relativeApplicationPath = path.relative(workspacePath, applicationPath).replace(/[\\/]+/g, '/');
    const diff = getGitDiff(execAppOptions.cwd);
    expect(diff.added).toContain(path.posix.join(relativeApplicationPath, 'jest.config.js'));
    expect(diff.added).toContain(path.posix.join(relativeApplicationPath, 'testing', 'setup-jest.ts'));
    expect(diff.added).toContain(path.posix.join(relativeApplicationPath, 'e2e-playwright', 'playwright-config.ts'));
    expect(diff.added).toContain(path.posix.join(relativeApplicationPath, 'e2e-playwright', 'empty-test.e2e.ts'));
    expect(diff.added).toContain('jest.config.js');
    expect(diff.added).toContain('jest.config.ut.js');
    expect(diff.added).toContain('tsconfig.jest.json');
    const packageJsonContent = fs.readFileSync(path.join(applicationPath, 'package.json'), { encoding: 'utf8' });
    expect(packageJsonContent).toContain('@o3r/testing');
    expect(packageJsonContent).toContain('@playwright/test');
    const vscodeContent = fs.readFileSync(`${workspacePath}/.vscode/extensions.json`, 'utf8');
    expect(vscodeContent).toContain('"Orta.vscode-jest"');

    [libraryPath, ...untouchedProjectsPaths].forEach((untouchedProject) => {
      expect(diff.all.some((file) => file.startsWith(path.relative(workspacePath, untouchedProject).replace(/\\+/g, '/')))).toBe(false);
    });

    expect(() => packageManagerInstall(execAppOptions)).not.toThrow();
    expect(() => packageManagerRunOnProject(appName, isInWorkspace, { script: 'build' }, execAppOptions)).not.toThrow();
    expect(() => packageManagerRunOnProject(appName, isInWorkspace, { script: 'test' }, execAppOptions)).not.toThrow();

    packageManagerExecOnProject(appName, isInWorkspace, { script: 'playwright', args: ['install', '--with-deps'] }, execAppOptions);
    expect(() => packageManagerRunOnProject(appName, isInWorkspace, { script: 'test:playwright' }, execAppOptions)).not.toThrow();
  });

  test('should add testing to an application and fixture to component', async () => {
    const { applicationPath, workspacePath, appName, isInWorkspace, o3rVersion, untouchedProjectsPaths, libraryPath } = o3rEnvironment.testEnvironment;
    const execAppOptions = { ...getDefaultExecSyncOptions(), cwd: workspacePath };
    const relativeApplicationPath = path.relative(workspacePath, applicationPath);
    packageManagerExec({
      script: 'ng',
      args: ['add', `@o3r/testing@${o3rVersion}`, '--no-enable-playwright', '--testing-framework', 'jest', '--skip-confirmation', '--project-name', appName]
    }, execAppOptions);

    const componentPath = path.join(relativeApplicationPath, 'src/components/test-component/container/test-component-cont.ts');
    packageManagerExec({ script: 'ng',
      args: ['g', '@o3r/core:component', 'test-component', '--use-component-fixtures', 'false', '--component-structure', 'full', '--project-name', appName] }, execAppOptions);
    packageManagerExec({ script: 'ng', args: ['g', '@o3r/testing:add-fixture', '--path', componentPath] }, execAppOptions);
    await addImportToAppModule(applicationPath, 'TestComponentCont', 'src/components/test-component');

    const diff = getGitDiff(execAppOptions.cwd);
    expect(diff.added).toContain(path.join(relativeApplicationPath, 'src/components/test-component/container/test-component-cont-fixture.ts').replace(/[/\\]+/g, '/'));

    [libraryPath, ...untouchedProjectsPaths].forEach((untouchedProject) => {
      expect(diff.all.some((file) => file.startsWith(path.relative(workspacePath, untouchedProject).replace(/\\+/g, '/')))).toBe(false);
    });

    expect(() => packageManagerInstall(execAppOptions)).not.toThrow();
    expect(() => packageManagerRunOnProject(appName, isInWorkspace, { script: 'build' }, execAppOptions)).not.toThrow();
    expect(() => packageManagerRunOnProject(appName, isInWorkspace, { script: 'test' }, execAppOptions)).not.toThrow();
  });

  test('should add testing to a library', () => {
    const { workspacePath, libName, isYarnTest, isInWorkspace, o3rVersion, applicationPath, untouchedProjectsPaths } = o3rEnvironment.testEnvironment;
    const execAppOptions = { ...getDefaultExecSyncOptions(), cwd: workspacePath };
    packageManagerExec({ script: 'ng', args: ['add', `@o3r/testing@${o3rVersion}`, '--testing-framework', 'jest', '--skip-confirmation', '--project-name', libName] }, execAppOptions);

    const diff = getGitDiff(execAppOptions.cwd);
    expect(diff.modified.toSorted()).toEqual([
      'angular.json',
      isYarnTest ? 'yarn.lock' : 'package-lock.json',
      'package.json',
      '.vscode/extensions.json',
      'libs/test-lib/package.json',
      'libs/test-lib/tsconfig.spec.json'
    ].toSorted());

    expect(diff.added.toSorted()).toEqual([
      'jest.config.js',
      'jest.config.ut.js',
      'tsconfig.jest.json',
      'libs/test-lib/jest.config.js',
      'libs/test-lib/testing/setup-jest.ts'
    ].toSorted());

    [applicationPath, ...untouchedProjectsPaths].forEach((untouchedProject) => {
      expect(diff.all.some((file) => file.startsWith(path.relative(workspacePath, untouchedProject).replace(/\\+/g, '/')))).toBe(false);
    });

    expect(() => packageManagerInstall(execAppOptions)).not.toThrow();
    expect(() => packageManagerRunOnProject(libName, isInWorkspace, { script: 'build' }, execAppOptions)).not.toThrow();
    expect(() => packageManagerRunOnProject(libName, isInWorkspace, { script: 'test' }, execAppOptions)).not.toThrow();
  });

  test('should add testing to a library and fixture to component', () => {
    const { applicationPath, workspacePath, libName, isInWorkspace, o3rVersion, untouchedProjectsPaths, libraryPath, isYarnTest } = o3rEnvironment.testEnvironment;
    const execAppOptions = { ...getDefaultExecSyncOptions(), cwd: workspacePath };
    const relativeLibraryPath = path.relative(workspacePath, libraryPath);
    packageManagerExec({ script: 'ng', args: ['add', `@o3r/testing@${o3rVersion}`, '--testing-framework', 'jest', '--skip-confirmation', '--project-name', libName] }, execAppOptions);

    const componentPath = path.join(relativeLibraryPath, 'src/components/test-component/container/test-component-cont.ts');
    packageManagerExec({ script: 'ng',
      args: ['g', '@o3r/core:component', 'test-component', '--use-component-fixtures', 'false', '--component-structure', 'full', '--project-name', libName] }, execAppOptions);
    packageManagerExec({ script: 'ng', args: ['g', '@o3r/testing:add-fixture', '--path', componentPath] }, execAppOptions);

    const diff = getGitDiff(execAppOptions.cwd);
    const addedFiles = [
      path.join('jest.config.ut.js'),
      path.join('jest.config.js'),
      path.join('tsconfig.jest.json'),
      path.join(relativeLibraryPath, 'jest.config.js').replace(/[/\\]+/g, '/'),
      path.join(relativeLibraryPath, 'testing/setup-jest.ts').replace(/[/\\]+/g, '/'),
      path.join(relativeLibraryPath, 'src/components/test-component/container/README.md').replace(/[/\\]+/g, '/'),
      path.join(relativeLibraryPath, 'src/components/test-component/container/index.ts').replace(/[/\\]+/g, '/'),
      path.join(relativeLibraryPath, 'src/components/test-component/container/test-component-cont-context.ts').replace(/[/\\]+/g, '/'),
      path.join(relativeLibraryPath, 'src/components/test-component/container/test-component-cont-fixture.ts').replace(/[/\\]+/g, '/'),
      path.join(relativeLibraryPath, 'src/components/test-component/container/test-component-cont.ts').replace(/[/\\]+/g, '/'),
      path.join(relativeLibraryPath, 'src/components/test-component/container/test-component-cont.spec.ts').replace(/[/\\]+/g, '/'),
      path.join(relativeLibraryPath, 'src/components/test-component/container/test-component-cont.html').replace(/[/\\]+/g, '/'),
      path.join(relativeLibraryPath, 'src/components/test-component/presenter/README.md').replace(/[/\\]+/g, '/'),
      path.join(relativeLibraryPath, 'src/components/test-component/presenter/index.ts').replace(/[/\\]+/g, '/'),
      path.join(relativeLibraryPath, 'src/components/test-component/fixtures.ts').replace(/[/\\]+/g, '/'),
      path.join(relativeLibraryPath, 'src/components/test-component/index.ts').replace(/[/\\]+/g, '/'),
      path.join(relativeLibraryPath, 'src/components/test-component/presenter/test-component-pres-context.ts').replace(/[/\\]+/g, '/'),
      path.join(relativeLibraryPath, 'src/components/test-component/presenter/test-component-pres.ts').replace(/[/\\]+/g, '/'),
      path.join(relativeLibraryPath, 'src/components/test-component/presenter/test-component-pres.spec.ts').replace(/[/\\]+/g, '/'),
      path.join(relativeLibraryPath, 'src/components/test-component/presenter/test-component-pres.scss').replace(/[/\\]+/g, '/'),
      path.join(relativeLibraryPath, 'src/components/test-component/presenter/test-component-pres.html').replace(/[/\\]+/g, '/')
    ].toSorted();
    expect(diff.added.toSorted()).toEqual(addedFiles);
    const modifiedFiles = [
      'angular.json',
      isYarnTest ? 'yarn.lock' : 'package-lock.json',
      'package.json',
      '.vscode/extensions.json',
      'libs/test-lib/package.json',
      'libs/test-lib/tsconfig.spec.json'
    ].toSorted();
    expect(diff.modified.toSorted()).toEqual(modifiedFiles);

    [applicationPath, ...untouchedProjectsPaths].forEach((untouchedProject) => {
      expect(diff.all.some((file) => file.startsWith(path.relative(workspacePath, untouchedProject).replace(/\\+/g, '/')))).toBe(false);
    });

    expect(() => packageManagerInstall(execAppOptions)).not.toThrow();
    expect(() => packageManagerRunOnProject(libName, isInWorkspace, { script: 'build' }, execAppOptions)).not.toThrow();
    expect(() => packageManagerRunOnProject(libName, isInWorkspace, { script: 'test' }, execAppOptions)).not.toThrow();
  });
  test('should add testing compatible with @o3r/eslint-config to an application', () => {
    const { workspacePath, appName, o3rVersion } = o3rEnvironment.testEnvironment;
    const execAppOptions = { ...getDefaultExecSyncOptions(), cwd: workspacePath };
    packageManagerExec({ script: 'ng', args: ['add', `@o3r/eslint-config@${o3rVersion}`, '--project-name', appName, '--skip-confirmation'] }, execAppOptions);
    packageManagerExec({ script: 'ng', args: ['add', `@o3r/testing@${o3rVersion}`, '--testing-framework', 'jest', '--skip-confirmation', '--project-name', appName] }, execAppOptions);
    expect(() => packageManagerExec({ script: 'ng', args: ['lint', appName, '--fix'] }, execAppOptions)).not.toThrow();
  });
});
