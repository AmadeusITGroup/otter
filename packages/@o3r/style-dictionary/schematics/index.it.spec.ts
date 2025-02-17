/**
 * Test environment exported by O3rEnvironment, must be first line of the file
 * @jest-environment @o3r/test-helpers/jest-environment
 * @jest-environment-o3r-app-folder test-app-localization
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

describe('ng add otter style-dictionary hooks', () => {
  test('should add style-dictionary to an application', () => {
    const { applicationPath, workspacePath, appName, isInWorkspace, o3rVersion } = o3rEnvironment.testEnvironment;
    const execAppOptions = { ...getDefaultExecSyncOptions(), cwd: workspacePath };
    const relativeApplicationPath = path.relative(workspacePath, applicationPath);
    expect(() => packageManagerExec({ script: 'ng', args: ['add', `@o3r/style-dictionary@${o3rVersion}`, '--skip-confirmation', '--project-name', appName] }, execAppOptions)).not.toThrow();
    expect(() => packageManagerInstall(execAppOptions)).not.toThrow();
    fs.writeFileSync(path.join(relativeApplicationPath, 'tokens', 'test.token.json'), JSON.stringify({ colors: { primary: { $value: '#000' } } }), { encoding: 'utf8' });
    expect(() => packageManagerRunOnProject(appName, isInWorkspace, { script: 'generate:css' }, execAppOptions)).not.toThrow();

    const diff = getGitDiff(workspacePath);
    expect(diff.modified.length).toBe(1);
    expect(diff.added.length).toBe(2);
    expect(diff.added).toContain(path.join(relativeApplicationPath, 'config.mjs').replace(/[/\\]+/g, '/'));
    expect(diff.added).toContain(path.join(relativeApplicationPath, 'default.tokens.css').replace(/[/\\]+/g, '/'));
    expect(fs.readFileSync(path.join(relativeApplicationPath, 'default.tokens.css').replace(/[/\\]+/g, '/'))).toContain('--color-primary: #000;');
  });
});
