/**
 * Test environment exported by O3rEnvironment, must be first line of the file
 * @jest-environment @o3r/test-helpers/jest-environment
 * @jest-environment-o3r-app-folder test-app-rules-engine
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

describe('ng add rules-engine', () => {
  test('should add rules engine to an application', async () => {
    const { applicationPath, workspacePath, appName, isInWorkspace, untouchedProjectsPaths, o3rVersion, libraryPath } = o3rEnvironment.testEnvironment;
    const execAppOptions = {...getDefaultExecSyncOptions(), cwd: workspacePath};
    const relativeApplicationPath = path.relative(workspacePath, applicationPath);
    expect(() => packageManagerExec({script: 'ng', args: ['add', `@o3r/rules-engine@${o3rVersion}`,
      '--enable-metadata-extract', '--project-name', appName, '--skip-confirmation']}, execAppOptions)).not.toThrow();
    const componentPath = path.normalize(path.posix.join(relativeApplicationPath, 'src/components/test-component/test-component.component.ts'));
    packageManagerExec({script: 'ng', args: ['g', '@o3r/core:component', 'test-component', '--activate-dummy', '--use-rules-engine', 'false', '--project-name', appName]}, execAppOptions);
    packageManagerExec({script: 'ng', args: ['g', '@o3r/rules-engine:rules-engine-to-component', '--path', componentPath]}, execAppOptions);
    await addImportToAppModule(applicationPath, 'TestComponentModule', 'src/components/test-component');

    const diff = getGitDiff(workspacePath);
    expect(diff.added).toContain('apps/test-app/cms.json');
    expect(diff.added).toContain('apps/test-app/placeholders.metadata.json');
    expect(diff.added).toContain('apps/test-app/tsconfig.cms.json');
    expect(diff.added.length).toBe(12);
    expect(diff.modified).toContain('apps/test-app/src/app/app.config.ts');
    expect(diff.modified.length).toBe(8);

    [libraryPath, ...untouchedProjectsPaths].forEach(untouchedProject => {
      expect(diff.all.some(file => file.startsWith(path.posix.relative(workspacePath, untouchedProject)))).toBe(false);
    });

    expect(() => packageManagerInstall(execAppOptions)).not.toThrow();
    expect(() => packageManagerRunOnProject(appName, isInWorkspace, {script: 'build'}, execAppOptions)).not.toThrow();
  });
  test('should add rules engine to a library', () => {
    const { applicationPath, workspacePath, isInWorkspace, o3rVersion, libraryPath, libName, untouchedProjectsPaths } = o3rEnvironment.testEnvironment;
    const execAppOptions = {...getDefaultExecSyncOptions(), cwd: workspacePath};
    const relativeLibraryPath = path.relative(workspacePath, libraryPath);
    expect(() => packageManagerExec({script: 'ng', args: ['add', `@o3r/rules-engine@${o3rVersion}`,
      '--enable-metadata-extract', '--project-name', libName, '--skip-confirmation']}, execAppOptions)).not.toThrow();
    const componentPath = path.normalize(path.posix.join(relativeLibraryPath, 'src/components/test-component/test-component.component.ts'));
    packageManagerExec({script: 'ng', args: ['g', '@o3r/core:component', 'test-component', '--activate-dummy', '--use-rules-engine', 'false', '--project-name', libName]}, execAppOptions);
    packageManagerExec({script: 'ng', args: ['g', '@o3r/rules-engine:rules-engine-to-component', '--path', componentPath]}, execAppOptions);

    const diff = getGitDiff(workspacePath);
    expect(diff.added).toContain('libs/test-lib/cms.json');
    expect(diff.added).toContain('libs/test-lib/placeholders.metadata.json');
    expect(diff.added).toContain('libs/test-lib/tsconfig.cms.json');
    expect(diff.added.length).toBe(12);
    expect(diff.modified).toContain('angular.json');
    expect(diff.modified).toContain('package.json');
    expect(diff.modified).toContain('libs/test-lib/package.json');
    expect(diff.modified.length).toBe(5);

    [applicationPath, ...untouchedProjectsPaths].forEach(untouchedProject => {
      expect(diff.all.some(file => file.startsWith(path.posix.relative(workspacePath, untouchedProject)))).toBe(false);
    });

    expect(() => packageManagerInstall(execAppOptions)).not.toThrow();
    expect(() => packageManagerRunOnProject(libName, isInWorkspace, {script: 'build'}, execAppOptions)).not.toThrow();
  });
});
