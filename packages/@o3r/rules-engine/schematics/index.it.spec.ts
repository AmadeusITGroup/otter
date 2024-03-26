import {
  addImportToAppModule,
  getDefaultExecSyncOptions,
  getGitDiff,
  packageManagerExec,
  packageManagerInstall,
  packageManagerRunOnProject,
  prepareTestEnv,
  setupLocalRegistry
} from '@o3r/test-helpers';
import { rm } from 'node:fs/promises';
import * as path from 'node:path';

const appFolder = 'test-app-rules-engine';
const o3rVersion = '999.0.0';
const execAppOptions = getDefaultExecSyncOptions();
let projectPath: string;
let workspacePath: string;
let projectName: string;
let isInWorkspace: boolean;
let untouchedProjectPath: undefined | string;
describe('new otter application with rules-engine', () => {
  setupLocalRegistry();
  beforeAll(async () => {
    ({ projectPath, workspacePath, projectName, isInWorkspace, untouchedProjectPath } = await prepareTestEnv(appFolder));
    execAppOptions.cwd = workspacePath;
  });
  afterAll(async () => {
    try { await rm(workspacePath, { recursive: true }); } catch { /* ignore error */ }
  });
  test('should add rules engine to existing application', async () => {
    const relativeProjectPath = path.relative(workspacePath, projectPath);
    packageManagerExec({script: 'ng', args: ['add', `@o3r/rules-engine@${o3rVersion}`, '--enable-metadata-extract', '--project-name', projectName, '--skip-confirmation']}, execAppOptions);

    const componentPath = path.normalize(path.join(relativeProjectPath, 'src/components/test-component/test-component.component.ts'));
    packageManagerExec({script: 'ng', args: ['g', '@o3r/core:component', 'test-component', '--activate-dummy', '--use-rules-engine', 'false', '--project-name', projectName]}, execAppOptions);
    packageManagerExec({script: 'ng', args: ['g', '@o3r/rules-engine:rules-engine-to-component', '--path', componentPath]}, execAppOptions);
    await addImportToAppModule(projectPath, 'TestComponentModule', 'src/components/test-component');

    const diff = getGitDiff(workspacePath);
    expect(diff.modified).toContain('package.json');

    if (untouchedProjectPath) {
      const relativeUntouchedProjectPath = path.relative(workspacePath, untouchedProjectPath);
      expect(diff.all.filter((file) => new RegExp(relativeUntouchedProjectPath.replace(/[\\/]+/g, '[\\\\/]')).test(file)).length).toBe(0);
    }

    expect(() => packageManagerInstall(execAppOptions)).not.toThrow();
    expect(() => packageManagerRunOnProject(projectName, isInWorkspace, {script: 'build'}, execAppOptions)).not.toThrow();
  });
});
