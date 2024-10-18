/**
 * Test environment exported by O3rEnvironment, must be first line of the file
 * @jest-environment @o3r/test-helpers/jest-environment
 * @jest-environment-o3r-app-folder test-app-eslint-config
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

describe('new otter application with eslint config', () => {
  test('should add eslint config to existing application', () => {
    const { workspacePath, appName, isInWorkspace, untouchedProjectsPaths, o3rVersion } = o3rEnvironment.testEnvironment;
    const execAppOptions = { ...getDefaultExecSyncOptions(), cwd: workspacePath };
    packageManagerExec({ script: 'ng', args: ['add', `@o3r/eslint-config@${o3rVersion}`, '--skip-confirmation', '--project-name', appName] }, execAppOptions);

    expect(() => packageManagerInstall(execAppOptions)).not.toThrow();
    expect(() => packageManagerRunOnProject(appName, isInWorkspace, { script: 'build' }, execAppOptions)).not.toThrow();

    const diff = getGitDiff(workspacePath);
    expect(diff.modified).toContain('package.json');
    expect(diff.added).toContain('tsconfig.eslint.json');
    expect(diff.added).toContain('eslint.shared.config.mjs');
    expect(diff.added).toContain('eslint.local.config.mjs');
    expect(diff.added).toContain('eslint.config.mjs');
    expect(diff.added).toContain(path.posix.join('apps', appName, 'tsconfig.eslint.json'));
    expect(diff.added).toContain(path.posix.join('apps', appName, 'eslint.local.config.mjs'));
    expect(diff.added).toContain(path.posix.join('apps', appName, 'eslint.config.mjs'));

    untouchedProjectsPaths.forEach((untouchedProject) => {
      expect(diff.all.some((file) => file.startsWith(path.posix.relative(workspacePath, untouchedProject)))).toBe(false);
    });
  });
});
