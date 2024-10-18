/**
 * Test environment exported by O3rEnvironment, must be first line of the file
 * @jest-environment @o3r/test-helpers/jest-environment
 * @jest-environment-o3r-app-folder test-app-extractors
 */
import * as path from 'node:path';
import {
  getDefaultExecSyncOptions,
  getGitDiff,
  packageManagerExec,
  packageManagerInstall,
  packageManagerRunOnProject
} from '@o3r/test-helpers';

const o3rEnvironment = globalThis.o3rEnvironment;

describe('ng add extractors', () => {
  test('should add extractors to an application', () => {
    const { workspacePath, appName, isInWorkspace, isYarnTest, o3rVersion, libraryPath, untouchedProjectsPaths } = o3rEnvironment.testEnvironment;
    const execAppOptions = { ...getDefaultExecSyncOptions(), cwd: workspacePath };
    expect(() => packageManagerExec({ script: 'ng', args: ['add', `@o3r/extractors@${o3rVersion}`, '--skip-confirmation', '--project-name', appName] }, execAppOptions)).not.toThrow();

    const diff = getGitDiff(workspacePath);
    expect(diff.modified.sort()).toEqual([
      'angular.json',
      '.gitignore',
      'package.json',
      'apps/test-app/package.json',
      isYarnTest ? 'yarn.lock' : 'package-lock.json'
    ].sort());
    expect(diff.added.sort()).toEqual([
      'apps/test-app/cms.json',
      'apps/test-app/placeholders.metadata.json',
      'apps/test-app/tsconfig.cms.json',
      'apps/test-app/migration-scripts/README.md'
    ].sort());

    [libraryPath, ...untouchedProjectsPaths].forEach((untouchedProject) => {
      expect(diff.all.some((file) => file.startsWith(path.posix.relative(workspacePath, untouchedProject)))).toBe(false);
    });

    expect(() => packageManagerInstall(execAppOptions)).not.toThrow();
    expect(() => packageManagerRunOnProject(appName, isInWorkspace, { script: 'build' }, execAppOptions)).not.toThrow();
  });

  test('should add extractors to a library', () => {
    const { workspacePath, libName, isInWorkspace, isYarnTest, o3rVersion, applicationPath, untouchedProjectsPaths } = o3rEnvironment.testEnvironment;
    const execAppOptions = { ...getDefaultExecSyncOptions(), cwd: workspacePath };
    expect(() => packageManagerExec({ script: 'ng', args: ['add', `@o3r/extractors@${o3rVersion}`, '--skip-confirmation', '--project-name', libName] }, execAppOptions)).not.toThrow();

    const diff = getGitDiff(workspacePath);
    expect(diff.modified.sort()).toEqual([
      'angular.json',
      '.gitignore',
      'package.json',
      'libs/test-lib/package.json',
      isYarnTest ? 'yarn.lock' : 'package-lock.json'
    ].sort());
    expect(diff.added.sort()).toEqual([
      'libs/test-lib/cms.json',
      'libs/test-lib/placeholders.metadata.json',
      'libs/test-lib/tsconfig.cms.json',
      'libs/test-lib/migration-scripts/README.md'
    ].sort());

    [applicationPath, ...untouchedProjectsPaths].forEach((untouchedProject) => {
      expect(diff.all.some((file) => file.startsWith(path.posix.relative(workspacePath, untouchedProject)))).toBe(false);
    });

    expect(() => packageManagerInstall(execAppOptions)).not.toThrow();
    expect(() => packageManagerRunOnProject(libName, isInWorkspace, { script: 'build' }, execAppOptions)).not.toThrow();
  });
});
