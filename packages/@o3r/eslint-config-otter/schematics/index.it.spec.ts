/**
 * Test environment exported by O3rEnvironment, must be first line of the file
 * @jest-environment @o3r/test-helpers/jest-environment
 * @jest-environment-o3r-app-folder test-app-eslint-config
 */
const o3rEnvironment = globalThis.o3rEnvironment;

import path from 'node:path';
import {
  getDefaultExecSyncOptions,
  getGitDiff,
  packageManagerExec,
  packageManagerInstall,
  packageManagerRunOnProject
} from '@o3r/test-helpers';

describe('ng add eslint-config', () => {
  test('should add eslint-config to an application', () => {
    const { workspacePath, appName, libraryPath, untouchedProjectsPaths, isInWorkspace, isYarnTest, o3rVersion } = o3rEnvironment.testEnvironment;
    const execAppOptions = { ...getDefaultExecSyncOptions(), cwd: workspacePath };
    packageManagerExec({ script: 'ng', args: ['add', `@o3r/eslint-config-otter@${o3rVersion}`, '--skip-confirmation', '--project-name', appName] }, execAppOptions);
    const diff = getGitDiff(workspacePath);
    expect(diff.modified.sort()).toEqual([
      '.vscode/extensions.json',
      'angular.json',
      'apps/test-app/package.json',
      'apps/test-app/src/main.ts',
      'package.json',
      isYarnTest ? 'yarn.lock' : 'package-lock.json'
    ].sort());
    expect(diff.added.sort()).toEqual([
      '.eslintignore',
      '.eslintrc.js',
      'apps/test-app/.eslintrc.js',
      'apps/test-app/tsconfig.eslint.json'
    ]);

    [libraryPath, ...untouchedProjectsPaths].forEach((untouchedProject) => {
      expect(diff.all.some((file) => file.startsWith(path.posix.relative(workspacePath, untouchedProject)))).toBe(false);
    });

    expect(() => packageManagerInstall(execAppOptions)).not.toThrow();
    expect(() => packageManagerRunOnProject(appName, isInWorkspace, { script: 'build' }, execAppOptions)).not.toThrow();
    expect(() => packageManagerExec({ script: 'ng', args: ['lint', appName, '--fix'] }, execAppOptions)).not.toThrow();
  });

  test('should add eslint-config to a library', () => {
    const { workspacePath, libName, applicationPath, untouchedProjectsPaths, isInWorkspace, isYarnTest, o3rVersion } = o3rEnvironment.testEnvironment;
    const execAppOptions = { ...getDefaultExecSyncOptions(), cwd: workspacePath };
    packageManagerExec({ script: 'ng', args: ['add', `@o3r/eslint-config-otter@${o3rVersion}`, '--skip-confirmation', '--project-name', libName] }, execAppOptions);
    const diff = getGitDiff(workspacePath);

    expect(diff.modified.sort()).toEqual([
      '.vscode/extensions.json',
      'angular.json',
      'libs/test-lib/package.json',
      'package.json',
      isYarnTest ? 'yarn.lock' : 'package-lock.json'
    ].sort());
    expect(diff.added.sort()).toEqual([
      '.eslintignore',
      '.eslintrc.js',
      'libs/test-lib/.eslintrc.js',
      'libs/test-lib/tsconfig.eslint.json'
    ].sort());

    [applicationPath, ...untouchedProjectsPaths].forEach((untouchedProject) => {
      expect(diff.all.some((file) => file.startsWith(path.posix.relative(workspacePath, untouchedProject)))).toBe(false);
    });

    expect(() => packageManagerInstall(execAppOptions)).not.toThrow();
    expect(() => packageManagerRunOnProject(libName, isInWorkspace, { script: 'build' }, execAppOptions)).not.toThrow();
    expect(() => packageManagerExec({ script: 'ng', args: ['lint', libName, '--fix'] }, execAppOptions)).not.toThrow();
  });
});
