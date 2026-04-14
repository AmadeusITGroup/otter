/**
 * Test environment exported by O3rEnvironment, must be first line of the file
 * @jest-environment @o3r/test-helpers/jest-environment
 * @jest-environment-o3r-app-folder test-app-third-party
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

describe('new Angular application', () => {
  test('should add Otter Third Party to existing Angular app', async () => {
    const { applicationPath, workspacePath, libraryPath, isInWorkspace, isYarnTest, appName, o3rVersion, untouchedProjectsPaths } = o3rEnvironment.testEnvironment;
    const execAppOptions = { ...getDefaultExecSyncOptions(), cwd: workspacePath };
    const relativeApplicationPath = path.relative(workspacePath, applicationPath);

    packageManagerExec({ script: 'ng', args: ['add', `@o3r/third-party@${o3rVersion}`, '--project-name', appName, '--skip-confirmation'] }, execAppOptions);
    expect(() => packageManagerInstall(execAppOptions)).not.toThrow();

    const diff = getGitDiff(workspacePath);

    expect(diff.modified.sort()).toEqual([
      'package.json',
      'angular.json',
      'apps/test-app/package.json',
      isYarnTest ? 'yarn.lock' : 'package-lock.json'
    ].sort());
    expect(diff.added.length).toBe(0);

    const componentPath = path.normalize(path.posix.join(relativeApplicationPath, 'src/components/test/test.ts'));
    packageManagerExec({ script: 'ng', args: ['g', '@o3r/core:component', 'test', '--project-name', appName, '--use-localization', 'false'] }, execAppOptions);
    await addImportToAppModule(applicationPath, 'Test', 'src/components/test');
    packageManagerExec({ script: 'ng', args: ['g', '@o3r/third-party:iframe-to-component', '--path', componentPath] }, execAppOptions);

    [libraryPath, ...untouchedProjectsPaths].forEach((untouchedProject) => {
      expect(diff.all.some((file) => file.startsWith(path.relative(workspacePath, untouchedProject).replace(/\\+/g, '/')))).toBe(false);
    });
    expect(() => packageManagerRunOnProject(appName, isInWorkspace, { script: 'build' }, execAppOptions)).not.toThrow();
  });
});
