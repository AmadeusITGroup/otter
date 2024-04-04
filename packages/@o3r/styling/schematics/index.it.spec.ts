/**
 * Test environment exported by O3rEnvironment, must be first line of the file
 * @jest-environment @o3r/test-helpers/jest-environment
 * @jest-environment-o3r-app-folder test-app-styling
 */
const o3rEnvironment = globalThis.o3rEnvironment;

import {
  addImportToAppModule,
  getDefaultExecSyncOptions,
  getGitDiff,
  packageManagerExec,
  packageManagerInstall,
  packageManagerRunOnProject
} from '@o3r/test-helpers';
import * as path from 'node:path';

describe('new otter application with styling', () => {
  test('should add styling to existing application', async () => {
    const { projectPath, workspacePath, projectName, isInWorkspace, untouchedProjectPath, o3rVersion } = o3rEnvironment.testEnvironment;
    const execAppOptions = {...getDefaultExecSyncOptions(), cwd: workspacePath};
    const relativeProjectPath = path.relative(workspacePath, projectPath);
    packageManagerExec({script: 'ng', args: ['add', `@o3r/styling@${o3rVersion}`, '--enable-metadata-extract', '--skip-confirmation', '--project-name', projectName]}, execAppOptions);

    packageManagerExec({script: 'ng', args: ['g', '@o3r/core:component', '--defaults', 'true', 'test-component', '--use-otter-theming', 'false', '--project-name', projectName]}, execAppOptions);
    const filePath = path.normalize(path.join(relativeProjectPath, 'src/components/test-component/test-component.style.scss'));
    packageManagerExec({script: 'ng', args: ['g', '@o3r/styling:add-theming', '--path', filePath]}, execAppOptions);
    await addImportToAppModule(projectPath, 'TestComponentModule', 'src/components/test-component');

    const diff = getGitDiff(execAppOptions.cwd);
    expect(diff.modified).toContain('package.json');
    expect(diff.added).toContain(path.join(relativeProjectPath, 'src/components/test-component/test-component.style.theme.scss').replace(/[\\/]+/g, '/'));

    if (untouchedProjectPath) {
      const relativeUntouchedProjectPath = path.relative(workspacePath, untouchedProjectPath);
      expect(diff.all.filter((file) => new RegExp(relativeUntouchedProjectPath.replace(/[\\/]+/g, '[\\\\/]')).test(file)).length).toBe(0);
    }

    expect(() => packageManagerInstall(execAppOptions)).not.toThrow();
    expect(() => packageManagerRunOnProject(projectName, isInWorkspace, {script: 'build'}, execAppOptions)).not.toThrow();
  });
});
