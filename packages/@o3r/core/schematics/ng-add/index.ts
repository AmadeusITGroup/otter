import { chain, externalSchematic, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { lastValueFrom } from 'rxjs';
import type { PackageJson } from 'type-fest';
import { NgAddSchematicsSchema } from './schema';
import { displayModuleList } from '../rule-factories/module-list';
import { presets } from './presets';
import { AddDevInstall } from '@o3r/schematics';

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

    context.addTask(new AddDevInstall({
      packageName: [
        ...schematicsDependencies.map((dependency) => dependency + o3rCoreVersion)
      ].join(' '),
      hideOutput: false,
      quiet: false
    } as any));
    await lastValueFrom(context.engine.executePostTasks());

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
      (t, c) => {
        const { preset, ...forwardOptions } = options;
        const presetRunner = presets[preset];
        if (presetRunner.modules) {
          c.logger.info(`The following modules will be installed: ${presetRunner.modules.join(', ')}`);
        }
        return presetRunner.rule({ forwardOptions })(t, c);
      },
      async (t, c) => {
        const { OTTER_MODULE_KEYWORD, OTTER_MODULE_SUPPORTED_SCOPES } = await import('@o3r/schematics');
        const displayModuleListRule = displayModuleList(OTTER_MODULE_KEYWORD, OTTER_MODULE_SUPPORTED_SCOPES);
        return () => displayModuleListRule(t, c);
      }
    ])(tree, context);
  };
}
