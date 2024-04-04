/**
 * Test environment exported by O3rEnvironment, must be first line of the file
 * @jest-environment @o3r/test-helpers/jest-environment
 * @jest-environment-o3r-app-folder test-app-testing
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

describe('new otter application with testing', () => {
  test('should add testing to existing application', async () => {
    const { projectPath, workspacePath, projectName, isInWorkspace, untouchedProjectPath, o3rVersion } = o3rEnvironment.testEnvironment;
    const execAppOptions = {...getDefaultExecSyncOptions(), cwd: workspacePath};
    const relativeProjectPath = path.relative(workspacePath, projectPath);
    packageManagerExec({script: 'ng', args: ['add', `@o3r/testing@${o3rVersion}`, '--skip-confirmation', '--project-name', projectName]}, execAppOptions);

    const componentPath = path.join(relativeProjectPath, 'src/components/test-component/container/test-component-cont.component.ts');
    packageManagerExec({script: 'ng',
      args: ['g', '@o3r/core:component', 'test-component', '--use-component-fixtures', 'false', '--component-structure', 'full', '--project-name', projectName]}, execAppOptions);
    packageManagerExec({script: 'ng', args: ['g', '@o3r/testing:add-fixture', '--path', componentPath]}, execAppOptions);
    await addImportToAppModule(projectPath, 'TestComponentContModule', 'src/components/test-component');

    const diff = getGitDiff(execAppOptions.cwd);
    expect(diff.added).toContain(path.join(relativeProjectPath, 'src/components/test-component/container/test-component-cont.fixture.ts').replace(/[\\/]+/g, '/'));

    if (untouchedProjectPath) {
      const relativeUntouchedProjectPath = path.relative(workspacePath, untouchedProjectPath);
      expect(diff.all.filter((file) => new RegExp(relativeUntouchedProjectPath.replace(/[\\/]+/g, '[\\\\/]')).test(file)).length).toBe(0);
    }

    expect(() => packageManagerInstall(execAppOptions)).not.toThrow();
    expect(() => packageManagerRunOnProject(projectName, isInWorkspace, {script: 'build'}, execAppOptions)).not.toThrow();
  });
});
