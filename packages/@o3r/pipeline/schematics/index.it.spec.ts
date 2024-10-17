/**
 * Test environment exported by O3rEnvironment, must be first line of the file
 * @jest-environment @o3r/test-helpers/jest-environment
 * @jest-environment-o3r-app-folder test-app-pipeline
 */
const o3rEnvironment = globalThis.o3rEnvironment;

import {
  getDefaultExecSyncOptions,
  getGitDiff,
  packageManagerExec,
  packageManagerInstall
} from '@o3r/test-helpers';
import { execSync } from 'node:child_process';
import * as path from 'node:path';

describe('new otter project', () => {
  test('should add a GitHub pipeline to existing project', () => {
    const { isYarnTest, workspacePath, untouchedProjectsPaths, o3rVersion } = o3rEnvironment.testEnvironment;
    const execAppOptions = {...getDefaultExecSyncOptions(), cwd: workspacePath};
    packageManagerExec({script: 'ng', args: ['add', `@o3r/pipeline@${o3rVersion}`, '--skip-confirmation', '--toolkit', 'github']}, execAppOptions);

    expect(() => packageManagerInstall(execAppOptions)).not.toThrow();

    const diff = getGitDiff(workspacePath);
    expect(diff.added.length).toBe(2);
    expect(diff.modified.length).toBe(2);
    expect(diff.deleted.length).toBe(0);
    expect(diff.modified).toContain('package.json');
    expect(diff.modified).toContain(isYarnTest ? 'yarn.lock' : 'package-lock.json');
    ['.github/actions/setup/action.yml', '.github/workflows/main.yml'].forEach(yamlFile => {
      expect(diff.added).toContain(yamlFile);
      execSync(`npx -p @action-validator/cli action-validator ${yamlFile}`, execAppOptions);
    });

    untouchedProjectsPaths.forEach(untouchedProject => {
      expect(diff.all.some(file => file.startsWith(path.posix.relative(workspacePath, untouchedProject)))).toBe(false);
    });
  });

  test('should add a GitHub pipeline to existing project with custom runner and registry', () => {
    const { isYarnTest, workspacePath, untouchedProjectsPaths, o3rVersion } = o3rEnvironment.testEnvironment;
    const execAppOptions = {...getDefaultExecSyncOptions(), cwd: workspacePath};
    packageManagerExec({script: 'ng', args: ['add', `@o3r/pipeline@${o3rVersion}`,
      '--skip-confirmation',
      '--toolkit', 'github',
      '--npmRegistry', 'https://registry.npmjs.org',
      '--runner', 'custom-runner']}, execAppOptions);

    expect(() => packageManagerInstall(execAppOptions)).not.toThrow();

    const diff = getGitDiff(workspacePath);
    expect(diff.added.length).toBe(2);
    expect(diff.modified.length).toBe(3);
    expect(diff.deleted.length).toBe(0);
    expect(diff.modified).toContain('package.json');
    expect(diff.modified).toContain(isYarnTest ? 'yarn.lock' : 'package-lock.json');
    expect(diff.modified).toContain(isYarnTest ? '.yarnrc.yml' : '.npmrc');
    ['.github/actions/setup/action.yml', '.github/workflows/main.yml'].forEach(yamlFile => {
      expect(diff.added).toContain(yamlFile);
      execSync(`npx -p @action-validator/cli action-validator ${yamlFile}`, execAppOptions);
    });
    untouchedProjectsPaths.forEach(untouchedProject => {
      expect(diff.all.some(file => file.startsWith(path.posix.relative(workspacePath, untouchedProject)))).toBe(false);
    });
  });
});
