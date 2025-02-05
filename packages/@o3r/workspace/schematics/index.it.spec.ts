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
import { existsSync } from 'node:fs';
import * as path from 'node:path';

describe('new otter workspace', () => {
  test('should add sdk to an existing workspace', () => {
    const { workspacePath, isInWorkspace, untouchedProjectsPaths } = o3rEnvironment.testEnvironment;
    const execAppOptions = {...getDefaultExecSyncOptions(), cwd: workspacePath};
    packageManagerExec({script: 'ng', args: ['g', 'sdk', '@my-sdk/sdk']}, execAppOptions);

    const diff = getGitDiff(execAppOptions.cwd);
    untouchedProjectsPaths.forEach(untouchedProject => {
      expect(diff.all.some(file => file.startsWith(path.posix.relative(workspacePath, untouchedProject)))).toBe(false);
    });

    expect(() => packageManagerInstall(execAppOptions)).not.toThrow();
    expect(() => packageManagerRunOnProject('@my-sdk/sdk', isInWorkspace, {script: 'build'}, execAppOptions)).not.toThrow();
  });

  test('should add sdk to an existing workspace with spec package name', () => {
    const { workspacePath, isInWorkspace, untouchedProjectsPaths, o3rVersion, registry } = o3rEnvironment.testEnvironment;
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
    untouchedProjectsPaths.forEach(untouchedProject => {
      expect(diff.all.some(file => file.startsWith(path.posix.relative(workspacePath, untouchedProject)))).toBe(false);
    });

    expect(() => packageManagerInstall(execAppOptions)).not.toThrow();
    expect(() => packageManagerRunOnProject('@my-sdk/sdk', isInWorkspace, {script: 'build'}, execAppOptions)).not.toThrow();
    expect(() => packageManagerRunOnProject('@my-sdk/sdk', isInWorkspace, {script: 'spec:upgrade'}, execAppOptions)).not.toThrow();
  });

  test('should add a library to an existing workspace', () => {
    const { workspacePath } = o3rEnvironment.testEnvironment;
    const execAppOptions = {...getDefaultExecSyncOptions(), cwd: workspacePath};
    const libName = 'test-library';
    const inLibraryPath = path.resolve(workspacePath, 'libs', libName);
    expect(() => packageManagerInstall(execAppOptions)).not.toThrow();

    const generatedLibFiles = [
      'README.md',
      'ng-package.json',
      'package.json',
      'tsconfig.lib.json',
      'tsconfig.lib.prod.json',
      'tsconfig.spec.json',
      'src/public-api.ts',
      '.gitignore',
      '.npmignore',
      'jest.config.js',
      'tsconfig.builders.json',
      'tsconfig.json',
      'testing/setup-jest.ts'];
    expect(() => packageManagerExec({ script: 'ng', args: ['g', 'library', libName] }, execAppOptions)).not.toThrow();
    expect(existsSync(path.join(workspacePath, 'project'))).toBe(false);
    generatedLibFiles.forEach(file => expect(existsSync(path.join(inLibraryPath, file))).toBe(true));
    expect(() => packageManagerRunOnProject(libName, true, { script: 'build' }, execAppOptions)).not.toThrow();
  });
});
