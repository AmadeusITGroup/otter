/**
 * Test environment exported by O3rEnvironment, must be first line of the file
 * @jest-environment @o3r/test-helpers/jest-environment
 * @jest-environment-o3r-app-folder test-app-workspace
 */
const o3rEnvironment = globalThis.o3rEnvironment;

import {
  getDefaultExecSyncOptions, getGitDiff,
  packageManagerExec,
  packageManagerInstall,
  packageManagerRunOnProject
} from '@o3r/test-helpers';
import * as path from 'node:path';

describe('new otter workspace', () => {
  test('should add sdk to an existing workspace', () => {
    const { workspacePath, isInWorkspace, untouchedProjectPath } = o3rEnvironment.testEnvironment;
    const execAppOptions = {...getDefaultExecSyncOptions(), cwd: workspacePath};
    packageManagerExec({script: 'ng', args: ['g', 'sdk', '@my-sdk/sdk']}, execAppOptions);

    const diff = getGitDiff(execAppOptions.cwd);
    if (untouchedProjectPath) {
      const relativeUntouchedProjectPath = path.relative(workspacePath, untouchedProjectPath);
      expect(diff.all.filter((file) => new RegExp(relativeUntouchedProjectPath.replace(/[\\/]+/g, '[\\\\/]')).test(file)).length).toBe(0);
    }

    expect(() => packageManagerInstall(execAppOptions)).not.toThrow();
    expect(() => packageManagerRunOnProject('@my-sdk/sdk', isInWorkspace, {script: 'build'}, execAppOptions)).not.toThrow();
  });

  test('should add sdk to an existing workspace with spec package name', () => {
    const { workspacePath, isInWorkspace, untouchedProjectPath, o3rVersion, registry } = o3rEnvironment.testEnvironment;
    const execAppOptions = {...getDefaultExecSyncOptions(), cwd: workspacePath};
    packageManagerExec({script: 'ng', args: [
      'g',
      'sdk',
      '@my-sdk/sdk',
      '--spec-package-name', '@ama-sdk/showcase-sdk',
      '--spec-package-path', './openapi.yml',
      '--spec-package-registry', registry,
      '--spec-package-version', o3rVersion
    ]}, execAppOptions);

    const diff = getGitDiff(execAppOptions.cwd);
    if (untouchedProjectPath) {
      const relativeUntouchedProjectPath = path.relative(workspacePath, untouchedProjectPath);
      expect(diff.all.filter((file) => new RegExp(relativeUntouchedProjectPath.replace(/[\\/]+/g, '[\\\\/]')).test(file)).length).toBe(0);
    }

    expect(() => packageManagerInstall(execAppOptions)).not.toThrow();
    expect(() => packageManagerRunOnProject('@my-sdk/sdk', isInWorkspace, {script: 'build'}, execAppOptions)).not.toThrow();
    expect(() => packageManagerRunOnProject('@my-sdk/sdk', isInWorkspace, {script: 'spec:upgrade'}, execAppOptions)).not.toThrow();
  });
});
