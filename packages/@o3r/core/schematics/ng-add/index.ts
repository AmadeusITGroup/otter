import { chain, externalSchematic, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import { NodePackageName } from '@angular-devkit/schematics/tasks/package-manager/options';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { lastValueFrom } from 'rxjs';
import type { PackageJson } from 'type-fest';
import { NgAddSchematicsSchema } from './schema';
import { displayModuleList } from '../rule-factories/module-list';

/**
 * Install dev dependency on your application
 *
 * Note: it should not be moved to other packages as it should run before the installation
 * of peer dependencies
 */
class DevInstall extends NodePackageInstallTask {
  public quiet = false;

  /** @inheritdoc */
  public toConfiguration() {
    const installOptions = process.env?.npm_execpath?.includes('yarn')  ? 'yarn' : 'npm';
    return {
      name: NodePackageName,
      options: {
        command: 'install',
        quiet: this.quiet,
        workingDirectory: this.workingDirectory,
        packageName: `${this.packageName!} ${installOptions === 'yarn' ? '--prefer-dev' : '-D'}`,
        packageManager: installOptions
      }
    };
  }
}

/**
 * Add Otter library to an Angular Project
 *
 * @param options
 */
export function ngAdd(options: NgAddSchematicsSchema): Rule {
  return async (tree: Tree, context: SchematicContext) => {
    const corePackageJsonContent = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', '..', 'package.json'), {encoding: 'utf-8'})) as PackageJson;
    const o3rCoreVersion = corePackageJsonContent.version ? `@${corePackageJsonContent.version}` : '';
    const schematicsDependencies = ['@o3r/dev-tools', '@o3r/schematics'];
    for (const dependency of schematicsDependencies) {
      context.addTask(new DevInstall({
        packageName: dependency + o3rCoreVersion,
        hideOutput: false,
        quiet: false
      } as any));
      await lastValueFrom(context.engine.executePostTasks());
    }

    return () => chain([
      ...schematicsDependencies.map((dep) => externalSchematic(dep, 'ng-add', {})),
      async (t, c) => {
        const {prepareProject} = await import('./project-setup/index');
        return prepareProject(options)(t, c);
      },
      async (t, c) => {
        const { registerPackageCollectionSchematics } = await import('@o3r/schematics');
        return () => registerPackageCollectionSchematics(corePackageJsonContent)(t, c);
      },
      async (t, c) => {
        const { OTTER_MODULE_KEYWORD, OTTER_MODULE_SUPPORTED_SCOPES } = await import('@o3r/schematics');
        const displayModuleListRule = displayModuleList(OTTER_MODULE_KEYWORD, OTTER_MODULE_SUPPORTED_SCOPES);
        return () => displayModuleListRule(t, c);
      }
    ])(tree, context);
  };
}
