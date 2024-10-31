/**
 * Test environment exported by O3rEnvironment, must be first line of the file
 * @jest-environment @o3r/test-helpers/jest-environment
 * @jest-environment-o3r-app-folder test-app-apis-manager
 */
const o3rEnvironment = globalThis.o3rEnvironment;

import * as path from 'node:path';
import {
  getDefaultExecSyncOptions,
  getGitDiff,
  packageManagerExec,
  packageManagerInstall,
  packageManagerRunOnProject
} from '@o3r/test-helpers';

describe('new otter application with apis-manager', () => {
  test('should add apis-manager to existing application', () => {
    const { workspacePath, appName, isInWorkspace, isYarnTest, untouchedProjectsPaths, libraryPath, o3rVersion } = o3rEnvironment.testEnvironment;
    const execAppOptions = { ...getDefaultExecSyncOptions(), cwd: workspacePath };
    packageManagerExec({ script: 'ng', args: ['add', `@o3r/apis-manager@${o3rVersion}`, '--skip-confirmation', '--project-name', appName] }, execAppOptions);

    expect(() => packageManagerInstall(execAppOptions)).not.toThrow();
    expect(() => packageManagerRunOnProject(appName, isInWorkspace, { script: 'build' }, execAppOptions)).not.toThrow();

    const diff = getGitDiff(workspacePath);
    expect(diff.modified.sort()).toEqual([
      'apps/test-app/package.json',
      'apps/test-app/src/app/app.config.ts',
      'apps/test-app/tsconfig.app.json',
      'package.json',
      isYarnTest ? 'yarn.lock' : 'package-lock.json'
    ].sort());

    [libraryPath, ...untouchedProjectsPaths].forEach((untouchedProject) => {
      expect(diff.all.some((file) => file.startsWith(path.posix.relative(workspacePath, untouchedProject)))).toBe(false);
    });
  });
});
