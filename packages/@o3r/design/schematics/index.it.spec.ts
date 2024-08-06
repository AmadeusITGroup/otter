/**
 * Test environment exported by O3rEnvironment, must be first line of the file
 * @jest-environment @o3r/test-helpers/jest-environment
 * @jest-environment-o3r-app-folder test-app-design
 */
const o3rEnvironment = globalThis.o3rEnvironment;

import {
  getDefaultExecSyncOptions,
  getGitDiff,
  packageManagerExec,
  packageManagerInstall,
  packageManagerRunOnProject
} from '@o3r/test-helpers';
import * as path from 'node:path';

describe('new otter application with Design', () => {
  test('should add design to existing application', () => {
    const { workspacePath, appName, isInWorkspace, untouchedProjectsPaths, o3rVersion } = o3rEnvironment.testEnvironment;
    const execAppOptions = {...getDefaultExecSyncOptions(), cwd: workspacePath};
    packageManagerExec({script: 'ng', args: ['add', `@o3r/design@${o3rVersion}`, '--skip-confirmation', '--project-name', appName]}, execAppOptions);

    expect(() => packageManagerInstall(execAppOptions)).not.toThrow();
    expect(() => packageManagerRunOnProject(appName, isInWorkspace, {script: 'build'}, execAppOptions)).not.toThrow();

    const diff = getGitDiff(workspacePath);
    expect(diff.modified).toContain('package.json');
    expect(diff.modified).toContain('angular.json');
    expect(diff.added).toContain(path.posix.join('apps', appName, 'src/style/design-token.custom.json'));
    expect(diff.added).toContain(path.posix.join('apps', appName, 'src/style/theme.scss'));
    expect(diff.added).toContain(path.posix.join('apps', appName, 'design-token.template.json'));

    untouchedProjectsPaths.forEach(untouchedProject => {
      expect(diff.all.some(file => file.startsWith(path.posix.relative(workspacePath, untouchedProject)))).toBe(false);
    });
  });
});
