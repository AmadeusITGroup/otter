/**
 * Test environment exported by O3rEnvironment, must be first line of the file
 * @jest-environment @o3r/test-helpers/jest-environment
 * @jest-environment-o3r-app-folder test-app-stylelint-plugin
 */
const o3rEnvironment = globalThis.o3rEnvironment;

import {
  addImportToAppModule,
  getDefaultExecSyncOptions,
  getGitDiff,
  packageManagerExec,
  packageManagerExecOnProject,
  packageManagerInstall,
  packageManagerRunOnProject
} from '@o3r/test-helpers';
import { writeFile } from 'node:fs/promises';
import * as path from 'node:path';

describe('ng add stylelint-plugin', () => {

  test('should add stylelint-plugin to an application', async () => {
    const { applicationPath, workspacePath, appName, isInWorkspace, isYarnTest, libraryPath, untouchedProjectsPaths, o3rVersion } = o3rEnvironment.testEnvironment;
    const execAppOptions = {...getDefaultExecSyncOptions(), cwd: workspacePath};
    packageManagerExec({script: 'ng', args: ['add', `@o3r/stylelint-plugin@${o3rVersion}`, '--enable-metadata-extract', '--skip-confirmation', '--project-name', appName]}, execAppOptions);
    const diff = getGitDiff(workspacePath);

    expect(diff.modified.sort()).toEqual([
      'apps/test-app/package.json',
      'package.json',
      isYarnTest ? 'yarn.lock' : 'package-lock.json'
    ].sort());
    expect(diff.added.length).toBe(0);

    [libraryPath, ...untouchedProjectsPaths].forEach(untouchedProject => {
      expect(diff.all.some(file => file.startsWith(path.posix.relative(workspacePath, untouchedProject)))).toBe(false);
    });
    packageManagerExec({script: 'ng', args: ['g', '@o3r/core:component', '--defaults', 'true', 'test-component', '--use-otter-theming', 'false', '--project-name', appName]}, execAppOptions);

    await addImportToAppModule(applicationPath, 'TestComponentModule', 'src/components/test-component');
    await writeFile(path.join(applicationPath, '.stylelintrc.json'), JSON.stringify({
      plugins: [
        '@o3r/stylelint-plugin'
      ],
      customSyntax: 'postcss-scss',
      rules: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        '@o3r/o3r-var-parameter-equal-variable': true
      }
    }, null, 2));

    expect(() => packageManagerInstall(execAppOptions)).not.toThrow();
    expect(() => packageManagerRunOnProject(appName, isInWorkspace, {script: 'build'}, execAppOptions)).not.toThrow();
    expect(() => packageManagerExecOnProject(appName, isInWorkspace, {
      script: 'stylelint',
      args: [path.join(applicationPath, 'src', 'components', 'test-component', 'test-component.style.scss')]
    }, execAppOptions)).not.toThrow();
  });

  test('should add stylelint-plugin to a library', async () => {
    const { applicationPath, workspacePath, libName, libraryPath, isInWorkspace, isYarnTest, untouchedProjectsPaths, o3rVersion } = o3rEnvironment.testEnvironment;
    const execAppOptions = {...getDefaultExecSyncOptions(), cwd: workspacePath};
    packageManagerExec({script: 'ng', args: ['add', `@o3r/stylelint-plugin@${o3rVersion}`, '--enable-metadata-extract', '--skip-confirmation', '--project-name', libName]}, execAppOptions);
    const diff = getGitDiff(workspacePath);

    expect(diff.modified.sort()).toEqual([
      'libs/test-lib/package.json',
      'package.json',
      isYarnTest ? 'yarn.lock' : 'package-lock.json'
    ].sort());
    expect(diff.added.length).toBe(0);

    [applicationPath, ...untouchedProjectsPaths].forEach(untouchedProject => {
      expect(diff.all.some(file => file.startsWith(path.posix.relative(workspacePath, untouchedProject)))).toBe(false);
    });
    packageManagerExec({script: 'ng', args: ['g', '@o3r/core:component', '--defaults', 'true', 'test-component', '--use-otter-theming', 'false', '--project-name', libName]}, execAppOptions);

    await writeFile(path.join(libraryPath, '.stylelintrc.json'), JSON.stringify({
      plugins: [
        '@o3r/stylelint-plugin'
      ],
      customSyntax: 'postcss-scss',
      rules: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        '@o3r/o3r-var-parameter-equal-variable': true
      }
    }, null, 2));

    expect(() => packageManagerInstall(execAppOptions)).not.toThrow();
    expect(() => packageManagerRunOnProject(libName, isInWorkspace, {script: 'build'}, execAppOptions)).not.toThrow();
    expect(() => packageManagerExecOnProject(libName, isInWorkspace, {
      script: 'stylelint',
      args: [path.join(libraryPath, 'src', 'components', 'test-component', 'test-component.style.scss')]
    }, execAppOptions)).not.toThrow();
  });
});
