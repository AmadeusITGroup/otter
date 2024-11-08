/**
 * Test environment exported by O3rEnvironment, must be first line of the file
 * @jest-environment @o3r/test-helpers/jest-environment
 * @jest-environment-o3r-app-folder test-app-application
 */

const o3rEnvironment = globalThis.o3rEnvironment;

import {
  getDefaultExecSyncOptions,
  packageManagerExec,
  packageManagerInstall,
  packageManagerRunOnProject,
} from '@o3r/test-helpers';

describe('new Angular application', () => {
  test('should add Otter Application to existing Angular app', () => {
    const { workspacePath, isInWorkspace, appName, o3rVersion } = o3rEnvironment.testEnvironment;
    const execAppOptions = { ...getDefaultExecSyncOptions(), cwd: workspacePath };
    packageManagerExec({ script: 'ng', args: ['add', `@o3r/application@${o3rVersion}`, '--project-name', appName, '--skip-confirmation'] }, execAppOptions);
    expect(() => packageManagerInstall(execAppOptions)).not.toThrow();

    expect(() => packageManagerRunOnProject(appName, isInWorkspace, { script: 'build' }, execAppOptions)).not.toThrow();
  });
});
