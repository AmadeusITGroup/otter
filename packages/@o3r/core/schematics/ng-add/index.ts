import { chain, externalSchematic, noop, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { lastValueFrom } from 'rxjs';
import type { PackageJson } from 'type-fest';
import { getExternalPreset, presets } from '../shared/presets';
import { NgAddSchematicsSchema } from './schema';
import { askConfirmation } from '@angular/cli/src/utilities/prompt';
import { AddDevInstall, displayModuleListRule, isPackageInstalled, registerPackageCollectionSchematics, setupSchematicsDefaultParams } from '@o3r/schematics';
import { prepareProject } from './project-setup/index';

/**
 * Add Otter library to an Angular Project
 * @param options
 */
export function ngAdd(options: NgAddSchematicsSchema): Rule {
  const corePackageJsonContent = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', '..', 'package.json'), {encoding: 'utf-8'})) as PackageJson;
  const o3rCoreVersion = corePackageJsonContent.version ? `@${corePackageJsonContent.version}` : '';
  const schematicsDependencies = ['@o3r/schematics'];

  return async (tree: Tree, context: SchematicContext): Promise<Rule> => {
    // check if the workspace package is installed, if not installed and we are in workspace context, we install
    const workspacePackageName = '@o3r/workspace';
    if (!options.projectName && !isPackageInstalled(workspacePackageName)) {
      schematicsDependencies.push(workspacePackageName);
    }

    context.addTask(new AddDevInstall({
      packageName: [
        ...schematicsDependencies.map((dependency) => dependency + o3rCoreVersion)
      ].join(' '),
      hideOutput: false,
      quiet: false,
      force: options.forceInstall
    } as any));
    await lastValueFrom(context.engine.executePostTasks());

    return () => chain([
      // eslint-disable-next-line @typescript-eslint/naming-convention
      setupSchematicsDefaultParams({ '*:ng-add': { registerDevtool: options.withDevtool } }),
      ...schematicsDependencies.map((dep) => externalSchematic(dep, 'ng-add', options)),
      options.projectName ? prepareProject(options) : noop(),
      registerPackageCollectionSchematics(corePackageJsonContent),
      async (t, c) => {
        const { preset, externalPresets, ...forwardOptions } = options;
        const presetRunner = await presets[preset]({ projectName: forwardOptions.projectName, forwardOptions });
        const externalPresetRunner = externalPresets ? await getExternalPreset(externalPresets, t, c)?.({ projectName: forwardOptions.projectName, forwardOptions }) : undefined;
        const modules = [...new Set([...(presetRunner.modules || []), ...(externalPresetRunner?.modules || [])])];
        if (modules.length) {
          c.logger.info(`The following modules will be installed: ${modules.join(', ')}`);
          if (c.interactive && !await askConfirmation('Would you like to process to the setup of these modules?', true)) {
            return;
          }
        }
        return () => chain([
          presetRunner.rule,
          externalPresetRunner?.rule || noop()
        ])(t, c);
      },
      displayModuleListRule({ packageName: options.projectName })
    ])(tree, context);
  };
}
