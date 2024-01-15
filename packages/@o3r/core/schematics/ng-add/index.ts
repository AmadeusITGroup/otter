import { chain, noop, Rule } from '@angular-devkit/schematics';
import * as fs from 'node:fs';
import * as path from 'node:path';
import type { PackageJson } from 'type-fest';
import { getExternalPreset, presets } from '../shared/presets';
import { NgAddSchematicsSchema } from './schema';
import { askConfirmation } from '@angular/cli/src/utilities/prompt';
import { createSchematicWithMetricsIfInstalled, displayModuleListRule, registerPackageCollectionSchematics, setupSchematicsDefaultParams } from '@o3r/schematics';
import { prepareProject } from './project-setup/index';
import {
  type DependencyToAdd,
  setupDependencies,
  type SetupDependenciesOptions
} from '@o3r/schematics';
import { NodeDependencyType } from '@schematics/angular/utility/dependencies';

const workspacePackageName = '@o3r/workspace';
const o3rDevDependencies = [
  '@o3r/schematics'
];

/**
 * Add Otter library to an Angular Project
 * @param options
 */
function ngAddFn(options: NgAddSchematicsSchema): Rule {
  const corePackageJsonContent = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', '..', 'package.json'), {encoding: 'utf-8'})) as PackageJson;
  const o3rCoreVersion = corePackageJsonContent.version!;

  return (): Rule => {
    const dependenciesSetupConfig: SetupDependenciesOptions = {
      projectName: options.projectName,
      dependencies: o3rDevDependencies.reduce((acc, dep) => {
        acc[dep] = {
          inManifest: [{
            range: `~${o3rCoreVersion}`,
            types: [NodeDependencyType.Dev]
          }]
        };
        return acc;
      }, {} as Record<string, DependencyToAdd>),
      ngAddToRun: [...o3rDevDependencies]
    };

    if (!options.projectName) {
      dependenciesSetupConfig.dependencies[workspacePackageName] = {
        toWorkspaceOnly: true,
        inManifest: [{
          range: `~${o3rCoreVersion}`,
          types: [NodeDependencyType.Default]
        }]
      };
      (dependenciesSetupConfig.ngAddToRun ||= []).push(workspacePackageName);
    }

    return chain([
      // eslint-disable-next-line @typescript-eslint/naming-convention
      setupSchematicsDefaultParams({ '*:ng-add': { registerDevtool: options.withDevtool } }),
      options.projectName ? prepareProject(options, dependenciesSetupConfig) : noop(),
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
      options.projectName ? displayModuleListRule({ packageName: options.projectName }) : noop(),
      setupDependencies(dependenciesSetupConfig)
    ]);
  };
}

/**
 * Add Otter library to an Angular Project
 * @param options
 */
export const ngAdd = createSchematicWithMetricsIfInstalled(ngAddFn);
