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

describe('new otter application with stylelint-plugin', () => {
  test('should add stylelint-plugin to existing application', async () => {
    const { projectPath, workspacePath, projectName, isInWorkspace, untouchedProjectPath, o3rVersion } = o3rEnvironment.testEnvironment;
    const execAppOptions = {...getDefaultExecSyncOptions(), cwd: workspacePath};
    packageManagerExec({script: 'ng', args: ['add', `@o3r/stylelint-plugin@${o3rVersion}`, '--enable-metadata-extract', '--skip-confirmation', '--project-name', projectName]}, execAppOptions);

    packageManagerExec({script: 'ng', args: ['g', '@o3r/core:component', '--defaults', 'true', 'test-component', '--use-otter-theming', 'false', '--project-name', projectName]}, execAppOptions);

    await addImportToAppModule(projectPath, 'TestComponentModule', 'src/components/test-component');
    await writeFile(path.join(projectPath, '.stylelintrc.json'), JSON.stringify({
      plugins: [
        '@o3r/stylelint-plugin'
      ],
      customSyntax: 'postcss-scss',
      rules: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        '@o3r/o3r-var-parameter-equal-variable': true
      }
    }, null, 2));

    const diff = getGitDiff(execAppOptions.cwd);
    expect(diff.modified).toContain('package.json');

    if (untouchedProjectPath) {
      const relativeUntouchedProjectPath = path.relative(workspacePath, untouchedProjectPath);
      expect(diff.all.filter((file) => new RegExp(relativeUntouchedProjectPath.replace(/[\\/]+/g, '[\\\\/]')).test(file)).length).toBe(0);
    }

    expect(() => packageManagerInstall(execAppOptions)).not.toThrow();
    expect(() => packageManagerRunOnProject(projectName, isInWorkspace, {script: 'build'}, execAppOptions)).not.toThrow();
    expect(() => packageManagerExecOnProject(projectName, isInWorkspace, {
      script: 'stylelint',
      args: [path.join(projectPath, 'src', 'components', 'test-component', 'test-component.style.scss')]
    }, execAppOptions)).not.toThrow();
  });
});
