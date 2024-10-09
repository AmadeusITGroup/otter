/**
 * Test environment exported by O3rEnvironment, must be first line of the file
 * @jest-environment @o3r/test-helpers/jest-environment
 * @jest-environment-o3r-app-folder test-app-configuration
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

describe('new otter application with configuration', () => {
  test('should add configuration to existing application', async () => {
    const { projectPath, workspacePath, projectName, isInWorkspace, untouchedProjectPath, o3rVersion } = o3rEnvironment.testEnvironment;
    const execAppOptions = {...getDefaultExecSyncOptions(), cwd: workspacePath};
    const relativeProjectPath = path.relative(workspacePath, projectPath);
    packageManagerExec({script: 'ng', args: ['add', `@o3r/configuration@${o3rVersion}`, '--skip-confirmation', '--project-name', projectName]}, execAppOptions);

    const componentPath = path.normalize(path.join(relativeProjectPath, 'src/components/test-component/test-component.component.ts'));
    packageManagerExec({script: 'ng', args: ['g', '@o3r/core:component', 'test-component', '--project-name', projectName, '--use-otter-config', 'false']}, execAppOptions);
    packageManagerExec({script: 'ng', args: ['g', '@o3r/configuration:add-config', '--path', componentPath]}, execAppOptions);
    await addImportToAppModule(projectPath, 'TestComponentModule', 'src/components/test-component');

    packageManagerExec({script: 'ng', args: ['g', '@o3r/core:component', 'test-signal', '--project-name', projectName, '--use-otter-config', 'false']}, execAppOptions);
    packageManagerExec({
      script: 'ng',
      args: ['g', '@o3r/configuration:add-config', '--path', path.join(relativeProjectPath, 'src/components/test-signal/test-signal.component.ts'), '--use-signal']
    }, execAppOptions);
    await addImportToAppModule(projectPath, 'TestSignalModule', 'src/components/test-signal');

    const diff = getGitDiff(workspacePath);
    expect(diff.modified).toContain('package.json');
    expect(diff.added).toContain(path.join(relativeProjectPath, 'src/components/test-component/test-component.config.ts').replace(/[\\/]+/g, '/'));
    expect(diff.added).toContain(path.join(relativeProjectPath, 'src/components/test-signal/test-signal.config.ts').replace(/[\\/]+/g, '/'));

    if (untouchedProjectPath) {
      const relativeUntouchedProjectPath = path.relative(workspacePath, untouchedProjectPath);
      expect(diff.all.filter((file) => new RegExp(relativeUntouchedProjectPath.replace(/[\\/]+/g, '[\\\\/]')).test(file)).length).toBe(0);
    }

    expect(() => packageManagerInstall(execAppOptions)).not.toThrow();
    expect(() => packageManagerRunOnProject(projectName, isInWorkspace, {script: 'build'}, execAppOptions)).not.toThrow();
  });
});
