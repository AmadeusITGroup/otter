/**
 * Test environment exported by O3rEnvironment, must be first line of the file
 * @jest-environment @o3r/test-helpers/jest-environment
 * @jest-environment-o3r-app-folder test-app-eslint-config
 */
const o3rEnvironment = globalThis.o3rEnvironment;

import {
  getDefaultExecSyncOptions,
  packageManagerExec,
  packageManagerInstall,
  packageManagerRunOnProject
} from '@o3r/test-helpers';

describe('new otter application with eslint-config', () => {
  test('should add eslint-config to existing application', () => {
    const { workspacePath, projectName, isInWorkspace, o3rVersion } = o3rEnvironment.testEnvironment;
    const execAppOptions = {...getDefaultExecSyncOptions(), cwd: workspacePath};
    packageManagerExec({script: 'ng', args: ['add', `@o3r/eslint-config-otter@${o3rVersion}`, '--skip-confirmation', '--project-name', projectName]}, execAppOptions);

    expect(() => packageManagerInstall(execAppOptions)).not.toThrow();
    expect(() => packageManagerRunOnProject(projectName, isInWorkspace, {script: 'build'}, execAppOptions)).not.toThrow();
    expect(() => packageManagerExec({script: 'ng', args: ['lint', projectName, '--fix']}, execAppOptions)).not.toThrow();
  });

  test('should add eslint-config to new library', () => {
    const libName = 'mylib';
    const { workspacePath, isInWorkspace, o3rVersion } = o3rEnvironment.testEnvironment;
    const execAppOptions = {...getDefaultExecSyncOptions(), cwd: workspacePath};
    packageManagerExec({script: 'ng', args: ['g', 'library', libName]}, execAppOptions);
    packageManagerExec({script: 'ng', args: ['add', `@o3r/eslint-config-otter@${o3rVersion}`, '--skip-confirmation', '--project-name', libName]}, execAppOptions);

    expect(() => packageManagerInstall(execAppOptions)).not.toThrow();
    expect(() => packageManagerRunOnProject(libName, isInWorkspace, {script: 'build'}, execAppOptions)).not.toThrow();
    expect(() => packageManagerExec({script: 'ng', args: ['lint', libName, '--fix']}, execAppOptions)).not.toThrow();
  });
});
