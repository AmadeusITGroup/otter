/**
 * Test environment exported by O3rEnvironment, must be first line of the file
 * @jest-environment @o3r/test-helpers/jest-environment
 * @jest-environment-o3r-app-folder test-app-style-dictionary
 */
const o3rEnvironment = globalThis.o3rEnvironment;

import {
  promises as fs,
} from 'node:fs';
import * as path from 'node:path';
import {
  getDefaultExecSyncOptions,
  getGitDiff,
  packageManagerExec,
  packageManagerInstall,
  packageManagerRunOnProject,
} from '@o3r/test-helpers';

describe('ng add otter style-dictionary hooks', () => {
  test('should add style-dictionary to an application', async () => {
    const { applicationPath, workspacePath, appName, isInWorkspace, o3rVersion } = o3rEnvironment.testEnvironment;
    const execAppOptions = { ...getDefaultExecSyncOptions(), cwd: workspacePath };
    const relativeApplicationPath = path.relative(workspacePath, applicationPath);
    expect(() => packageManagerExec({ script: 'ng', args: ['add', `@o3r/style-dictionary@${o3rVersion}`, '--skip-confirmation', '--project-name', appName] }, execAppOptions)).not.toThrow();
    expect(() => packageManagerInstall(execAppOptions)).not.toThrow();

    let diff = getGitDiff(workspacePath);
    expect(diff.modified.length).toBe(3);
    expect(diff.modified).toContain(path.join(relativeApplicationPath, 'package.json').replace(/[/\\]+/g, '/'));
    expect(diff.modified).toContain('package.json');
    expect(diff.added.length).toBe(2);
    expect(diff.added).toContain(path.join(relativeApplicationPath, 'token.extensions.json').replace(/[/\\]+/g, '/'));
    expect(diff.added).toContain(path.join(relativeApplicationPath, 'config.mjs').replace(/[/\\]+/g, '/'));

    await fs.writeFile(path.join(applicationPath, 'test.tokens.json'), JSON.stringify({ colors: { primary: { $value: '#000' } } }));

    expect(() => packageManagerRunOnProject(appName, isInWorkspace, { script: 'generate:css' }, execAppOptions)).not.toThrow();
    diff = getGitDiff(workspacePath);
    expect(diff.added.length).toBe(4);
    expect(diff.added).toContain(path.join(relativeApplicationPath, 'test.tokens.json').replace(/[/\\]+/g, '/'));
    expect(diff.added).toContain(path.join(relativeApplicationPath, 'default.tokens.css').replace(/[/\\]+/g, '/'));
    expect(await fs.readFile(path.join(applicationPath, 'default.tokens.css').replace(/[/\\]+/g, '/'), { encoding: 'utf8' })).toContain('--colors-primary: #000;');

    expect(() => packageManagerRunOnProject(appName, isInWorkspace, { script: 'generate:metadata' }, execAppOptions)).not.toThrow();
    diff = getGitDiff(workspacePath);
    expect(diff.added.length).toBe(5);
    expect(diff.added).toContain(path.join(relativeApplicationPath, 'style.metadata.json').replace(/[/\\]+/g, '/'));

    await fs.writeFile(path.join(applicationPath, 'src/styles.scss'), await fs.readFile(path.join(applicationPath, 'src/styles.scss'), { encoding: 'utf8' }) + '\n@import \'../default.tokens.css\';');
    expect(() => packageManagerRunOnProject(appName, isInWorkspace, { script: 'build' }, execAppOptions)).not.toThrow();
  });

  test('should add style-dictionary to a library', async () => {
    const { libraryPath, workspacePath, libName, isInWorkspace, o3rVersion } = o3rEnvironment.testEnvironment;
    const execAppOptions = { ...getDefaultExecSyncOptions(), cwd: workspacePath };
    const relativeLibraryPath = path.relative(workspacePath, libraryPath);
    expect(() => packageManagerExec({ script: 'ng', args: ['add', `@o3r/style-dictionary@${o3rVersion}`, '--skip-confirmation', '--project-name', libName] }, execAppOptions)).not.toThrow();
    expect(() => packageManagerInstall(execAppOptions)).not.toThrow();

    let diff = getGitDiff(workspacePath);
    expect(diff.modified.length).toBe(3);
    expect(diff.modified).toContain(path.join(relativeLibraryPath, 'package.json').replace(/[/\\]+/g, '/'));
    expect(diff.modified).toContain('package.json');
    expect(diff.added.length).toBe(2);
    expect(diff.added).toContain(path.join(relativeLibraryPath, 'token.extensions.json').replace(/[/\\]+/g, '/'));
    expect(diff.added).toContain(path.join(relativeLibraryPath, 'config.mjs').replace(/[/\\]+/g, '/'));

    await fs.writeFile(path.join(libraryPath, 'test.tokens.json'), JSON.stringify({ colors: { primary: { $value: '#000' } } }));

    expect(() => packageManagerRunOnProject(libName, isInWorkspace, { script: 'generate:css' }, execAppOptions)).not.toThrow();
    diff = getGitDiff(workspacePath);
    expect(diff.added.length).toBe(4);
    expect(diff.added).toContain(path.join(relativeLibraryPath, 'test.tokens.json').replace(/[/\\]+/g, '/'));
    expect(diff.added).toContain(path.join(relativeLibraryPath, 'default.tokens.css').replace(/[/\\]+/g, '/'));
    expect(await fs.readFile(path.join(libraryPath, 'default.tokens.css').replace(/[/\\]+/g, '/'), { encoding: 'utf8' })).toContain('--colors-primary: #000;');

    expect(() => packageManagerRunOnProject(libName, isInWorkspace, { script: 'generate:metadata' }, execAppOptions)).not.toThrow();
    diff = getGitDiff(workspacePath);
    expect(diff.added.length).toBe(5);
    expect(diff.added).toContain(path.join(relativeLibraryPath, 'style.metadata.json').replace(/[/\\]+/g, '/'));

    expect(() => packageManagerRunOnProject(libName, isInWorkspace, { script: 'build' }, execAppOptions)).not.toThrow();
  });
});
