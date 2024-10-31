/**
 * Test environment exported by O3rEnvironment, must be first line of the file
 * @jest-environment @o3r/test-helpers/jest-environment
 * @jest-environment-o3r-app-folder test-app-new-version
 */
const o3rEnvironment = globalThis.o3rEnvironment;

import {
  getDefaultExecSyncOptions,
  packageManagerExec,
  packageManagerInstall
} from '@o3r/test-helpers';

test('should add Otter Application to existing Angular app', () => {
  const { workspacePath, appName, o3rVersion } = o3rEnvironment.testEnvironment;
  const execAppOptions = { ...getDefaultExecSyncOptions(), cwd: workspacePath };
  packageManagerExec({ script: 'ng', args: ['add', `@o3r/new-version@${o3rVersion}`, '--project-name', appName, '--skip-confirmation'] }, execAppOptions);
  expect(() => packageManagerInstall(execAppOptions)).not.toThrow();
});
