import {
  getDefaultExecSyncOptions,
  getGitDiff,
  packageManagerExec,
  packageManagerInstall,
  packageManagerRunOnProject,
  prepareTestEnv,
  setupLocalRegistry
} from '@o3r/test-helpers';
import * as path from 'node:path';
import { rm } from 'node:fs/promises';

const appFolder = 'test-app-apis-manager';
const o3rVersion = '999.0.0';
const execAppOptions = getDefaultExecSyncOptions();
let workspacePath: string;
let projectName: string;
let isInWorkspace: boolean;
let untouchedProjectPath: undefined | string;
describe('new otter application with apis-manager', () => {
  setupLocalRegistry();
  beforeAll(async () => {
    ({ workspacePath, projectName, isInWorkspace, untouchedProjectPath } = await prepareTestEnv(appFolder));
    execAppOptions.cwd = workspacePath;
  });
  afterAll(async () => {
    try { await rm(workspacePath, { recursive: true }); } catch { /* ignore error */ }
  });
  test('should add apis-manager to existing application', () => {
    packageManagerExec({script: 'ng', args: ['add', `@o3r/apis-manager@${o3rVersion}`, '--skip-confirmation', '--project-name', projectName]}, execAppOptions);

    expect(() => packageManagerInstall(execAppOptions)).not.toThrow();
    expect(() => packageManagerRunOnProject(projectName, isInWorkspace, {script: 'build'}, execAppOptions)).not.toThrow();

    const diff = getGitDiff(workspacePath);
    expect(diff.modified).toContain('package.json');
    if (untouchedProjectPath) {
      const relativeUntouchedProjectPath = path.relative(workspacePath, untouchedProjectPath);
      expect(diff.all.filter((file) => new RegExp(relativeUntouchedProjectPath.replace(/[\\/]+/g, '[\\\\/]')).test(file)).length).toBe(0);
    }
  });
});
