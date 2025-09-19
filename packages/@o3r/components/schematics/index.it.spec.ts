/**
 * Test environment exported by O3rEnvironment, must be first line of the file
 * @jest-environment @o3r/test-helpers/jest-environment
 * @jest-environment-o3r-app-folder test-app-components
 */
const o3rEnvironment = globalThis.o3rEnvironment;

import * as fs from 'node:fs';
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
    const { workspacePath, appName, isInWorkspace, o3rVersion, isYarnTest, libraryPath, untouchedProjectsPaths } = o3rEnvironment.testEnvironment;
    const execAppOptions = { ...getDefaultExecSyncOptions(), cwd: workspacePath };
    expect(() => packageManagerExec({ script: 'ng', args: ['add', `@o3r/components@${o3rVersion}`,
      '--skip-confirmation', '--enable-metadata-extract', '--project-name', appName] }, execAppOptions)).not.toThrow();

    const diff = getGitDiff(workspacePath);
    expect(diff.modified.sort()).toEqual([
      '.gitignore',
      'angular.json',
      'apps/test-app/package.json',
      'apps/test-app/src/main.ts',
      isYarnTest ? 'yarn.lock' : 'package-lock.json',
      'package.json'
    ].sort());
    expect(diff.added.sort()).toEqual([
      'apps/test-app/placeholders.metadata.json',
      'apps/test-app/tsconfig.cms.json',
      'apps/test-app/migration-scripts/README.md'
    ].sort());

    [libraryPath, ...untouchedProjectsPaths].forEach((untouchedProject) => {
      expect(diff.all.some((file) => file.startsWith(path.relative(workspacePath, untouchedProject).replace(/\\+/g, '/')))).toBe(false);
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
    const angularJSON = JSON.parse(fs.readFileSync(`${workspacePath}/angular.json`, 'utf8'));
    expect(angularJSON.schematics['@o3r/core:component']).toBeDefined();
    expect(angularJSON.schematics['@o3r/core:component-container']).toBeDefined();
    expect(angularJSON.schematics['@o3r/core:component-presenter']).toBeDefined();
    expect(angularJSON.cli?.schematicCollections?.indexOf('@o3r/components') > -1).toBe(true);

    const packageJson = JSON.parse(fs.readFileSync(`${workspacePath}/package.json`, 'utf8'));
    expect(packageJson.dependencies['@o3r/components']).toBeDefined();

    expect(diff.added.sort()).toEqual([
      'libs/test-lib/placeholders.metadata.json',
      'libs/test-lib/tsconfig.cms.json',
      'libs/test-lib/migration-scripts/README.md'
    ].sort());

    [applicationPath, ...untouchedProjectsPaths].forEach((untouchedProject) => {
      expect(diff.all.some((file) => file.startsWith(path.relative(workspacePath, untouchedProject).replace(/\\+/g, '/')))).toBe(false);
    });

    expect(() => packageManagerInstall(execAppOptions)).not.toThrow();
    expect(() => packageManagerRunOnProject(libName, isInWorkspace, { script: 'build' }, execAppOptions)).not.toThrow();
  });
});
