/**
 * Test environment exported by O3rEnvironment, must be first line of the file
 * @jest-environment @o3r/test-helpers/jest-environment
 * @jest-environment-o3r-app-folder test-app-components
 */
const o3rEnvironment = globalThis.o3rEnvironment;

import * as path from 'node:path';
import {
  getDefaultExecSyncOptions,
  getGitDiff,
  packageManagerExec,
  packageManagerInstall,
  packageManagerRunOnProject,
} from '@o3r/test-helpers';

describe('ng add components', () => {
  test('should add components to an application', () => {
    const { workspacePath, appName, isInWorkspace, o3rVersion, libraryPath, untouchedProjectsPaths } = o3rEnvironment.testEnvironment;
    const execAppOptions = { ...getDefaultExecSyncOptions(), cwd: workspacePath };
    expect(() => packageManagerExec({ script: 'ng', args: ['add', `@o3r/components@${o3rVersion}`,
      '--skip-confirmation', '--enable-metadata-extract', '--project-name', appName] }, execAppOptions)).not.toThrow();

    const diff = getGitDiff(workspacePath);
    expect(diff.modified).toContain('package.json');
    expect(diff.modified).toContain('angular.json');
    expect(diff.modified).toContain('apps/test-app/package.json');
    expect(diff.modified.length).toBe(6);
    expect(diff.added).toContain('apps/test-app/cms.json');
    expect(diff.added).toContain('apps/test-app/placeholders.metadata.json');
    expect(diff.added).toContain('apps/test-app/tsconfig.cms.json');
    expect(diff.added).toContain('apps/test-app/migration-scripts/README.md');
    expect(diff.added.length).toBe(4);

    [libraryPath, ...untouchedProjectsPaths].forEach((untouchedProject) => {
      expect(diff.all.some((file) => file.startsWith(path.posix.relative(workspacePath, untouchedProject)))).toBe(false);
    });

    expect(() => packageManagerInstall(execAppOptions)).not.toThrow();
    expect(() => packageManagerRunOnProject(appName, isInWorkspace, { script: 'build' }, execAppOptions)).not.toThrow();
  });

  test('should add components to a library', () => {
    const { workspacePath, libName, isInWorkspace, o3rVersion, applicationPath, untouchedProjectsPaths } = o3rEnvironment.testEnvironment;
    const execAppOptions = { ...getDefaultExecSyncOptions(), cwd: workspacePath };
    expect(() => packageManagerExec({ script: 'ng', args: ['add', `@o3r/components@${o3rVersion}`,
      '--skip-confirmation', '--enable-metadata-extract', '--project-name', libName] }, execAppOptions)).not.toThrow();

    const diff = getGitDiff(workspacePath);
    expect(diff.modified).toContain('package.json');
    expect(diff.modified).toContain('angular.json');
    expect(diff.modified).toContain('libs/test-lib/package.json');
    expect(diff.modified.length).toBe(8);
    expect(diff.added).toContain('libs/test-lib/cms.json');
    expect(diff.added).toContain('libs/test-lib/placeholders.metadata.json');
    expect(diff.added).toContain('libs/test-lib/tsconfig.cms.json');
    expect(diff.added).toContain('libs/test-lib/migration-scripts/README.md');
    expect(diff.added.length).toBe(4);

    [applicationPath, ...untouchedProjectsPaths].forEach((untouchedProject) => {
      expect(diff.all.some((file) => file.startsWith(path.posix.relative(workspacePath, untouchedProject)))).toBe(false);
    });

    expect(() => packageManagerInstall(execAppOptions)).not.toThrow();
    expect(() => packageManagerRunOnProject(libName, isInWorkspace, { script: 'build' }, execAppOptions)).not.toThrow();
  });
});
