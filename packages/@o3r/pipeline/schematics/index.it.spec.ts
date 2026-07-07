/**
 * Test environment exported by O3rEnvironment, must be first line of the file
 * @jest-environment @o3r/test-helpers/jest-environment
 * @jest-environment-o3r-app-folder test-app-pipeline
 */
const o3rEnvironment = globalThis.o3rEnvironment;

import {
  execSync,
} from 'node:child_process';
import {
  readFileSync,
} from 'node:fs';
import * as path from 'node:path';
import {
  getDefaultExecSyncOptions,
  getGitDiff,
  packageManagerExec,
  packageManagerInstall,
} from '@o3r/test-helpers';
import type {
  PackageJson,
} from 'type-fest';

describe('new otter project', () => {
  test('should add a GitHub pipeline to existing project', () => {
    const { isYarnTest, workspacePath, untouchedProjectsPaths, o3rVersion } = o3rEnvironment.testEnvironment;
    const execAppOptions = { ...getDefaultExecSyncOptions(), cwd: workspacePath };
    packageManagerExec({ script: 'ng', args: ['add', `@o3r/pipeline@${o3rVersion}`, '--skip-confirmation', '--toolkit', 'github'] }, execAppOptions);

    expect(() => packageManagerInstall(execAppOptions)).not.toThrow();

    const diff = getGitDiff(workspacePath);
    const yamlFiles = ['.github/actions/setup/action.yml', '.github/workflows/main.yml'];

    expect(diff.added.sort()).toEqual(yamlFiles.sort());
    expect(diff.modified.sort()).toEqual([
      'package.json',
      isYarnTest ? 'yarn.lock' : 'package-lock.json'
    ].sort());
    expect(diff.deleted.length).toBe(0);

    const packageJson = JSON.parse(readFileSync(path.join(workspacePath, 'package.json'), { encoding: 'utf8' })) as PackageJson;
    expect(packageJson.devDependencies).toHaveProperty('@o3r/pipeline');
    expect(packageJson.dependencies).not.toHaveProperty('@o3r/pipeline');

    yamlFiles.forEach((yamlFile) => {
      execSync(`npx -p @action-validator/cli action-validator ${yamlFile}`, execAppOptions);
    });

    untouchedProjectsPaths.forEach((untouchedProject) => {
      expect(diff.all.some((file) => file.startsWith(path.relative(workspacePath, untouchedProject).replace(/\\+/g, '/')))).toBe(false);
    });
  });

  test('should add a GitHub pipeline to existing project with custom runner and registry', () => {
    const { isYarnTest, workspacePath, untouchedProjectsPaths, o3rVersion } = o3rEnvironment.testEnvironment;
    const execAppOptions = { ...getDefaultExecSyncOptions(), cwd: workspacePath };
    packageManagerExec({ script: 'ng', args: [
      'add', `@o3r/pipeline@${o3rVersion}`,
      '--skip-confirmation',
      '--toolkit', 'github',
      '--npmRegistry', 'https://registry.npmjs.org',
      '--runner', 'custom-runner'
    ] }, execAppOptions);

    expect(() => packageManagerInstall(execAppOptions)).not.toThrow();

    const diff = getGitDiff(workspacePath);
    const yamlFiles = ['.github/actions/setup/action.yml', '.github/workflows/main.yml'];

    expect(diff.added.sort()).toEqual(yamlFiles.sort());
    expect(diff.modified.sort()).toEqual([
      'package.json',
      isYarnTest ? 'yarn.lock' : 'package-lock.json',
      isYarnTest ? '.yarnrc.yml' : '.npmrc'
    ].sort());
    expect(diff.deleted.length).toBe(0);
    yamlFiles.forEach((yamlFile) => {
      execSync(`npx -p @action-validator/cli action-validator ${yamlFile}`, execAppOptions);
    });
    untouchedProjectsPaths.forEach((untouchedProject) => {
      expect(diff.all.some((file) => file.startsWith(path.relative(workspacePath, untouchedProject).replace(/\\+/g, '/')))).toBe(false);
    });
  });
});
