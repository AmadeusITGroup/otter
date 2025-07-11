import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  askConfirmation,
} from '@angular/cli/src/utilities/prompt';
import {
  chain,
  noop,
  Rule,
} from '@angular-devkit/schematics';
import {
  createOtterSchematic,
  displayModuleListRule,
  registerPackageCollectionSchematics,
  setupSchematicsParamsForProject,
} from '@o3r/schematics';
import {
  type DependencyToAdd,
  setupDependencies,
  type SetupDependenciesOptions,
} from '@o3r/schematics';
import {
  NodeDependencyType,
} from '@schematics/angular/utility/dependencies';
import type {
  PackageJson,
} from 'type-fest';
import {
  getExternalPreset,
  type PresetOptions,
  presets,
} from '../shared/presets';
import {
  prepareProject,
} from './project-setup/index';
import {
  NgAddSchematicsSchema,
} from './schema';
import {
  isUsingLegacyConfig,
} from './utils';

const workspacePackageName = '@o3r/workspace';
const o3rDevDependencies = [
  '@o3r/schematics'
];

/**
 * Add Otter library to an Angular Project
 * @param options
 */
function ngAddFn(options: NgAddSchematicsSchema): Rule {
  const corePackageJsonContent = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', '..', 'package.json'), { encoding: 'utf8' })) as PackageJson;
  const o3rCoreVersion = corePackageJsonContent.version!;
  const o3rVersionRange = options.exactO3rVersion ? o3rCoreVersion : `~${o3rCoreVersion}`;

  return (): Rule => {
    const dependenciesSetupConfig: SetupDependenciesOptions = {
      projectName: options.projectName,
      dependencies: o3rDevDependencies.reduce((acc, dep) => {
        acc[dep] = {
          inManifest: [{
            range: o3rVersionRange,
            types: [NodeDependencyType.Dev]
          }],
          ngAddOptions: { exactO3rVersion: options.exactO3rVersion }
        };
        return acc;
      }, {} as Record<string, DependencyToAdd>),
      ngAddToRun: [...o3rDevDependencies]
    };

    if (!options.projectName) {
      dependenciesSetupConfig.dependencies[workspacePackageName] = {
        toWorkspaceOnly: true,
        inManifest: [{
          range: o3rVersionRange,
          types: [NodeDependencyType.Default]
        }],
        ngAddOptions: { exactO3rVersion: options.exactO3rVersion }
      };
      (dependenciesSetupConfig.ngAddToRun ||= []).push(workspacePackageName);
    }

    return chain([
      setupSchematicsParamsForProject({ '*:ng-add': { registerDevtool: options.withDevtool } }, options.projectName),
      options.exactO3rVersion ? setupSchematicsParamsForProject({ '*:*': { exactO3rVersion: true } }, options.projectName) : noop(),
      // Warning: this should always be executed before the setup dependencies as it modifies the options.dependencies
      options.projectName ? prepareProject(options, dependenciesSetupConfig) : noop(),
      registerPackageCollectionSchematics(corePackageJsonContent),
      setupDependencies(dependenciesSetupConfig),
      async (t, c) => {
        const { preset, externalPresets, ...forwardOptions } = options;
        const presetOptions: PresetOptions = { projectName: forwardOptions.projectName, exactO3rVersion: forwardOptions.exactO3rVersion, forwardOptions, isUsingEslintLegacy: isUsingLegacyConfig(t) };
        const presetRunner = await presets[preset](presetOptions);
        const externalPresetRunner = externalPresets ? await getExternalPreset(externalPresets, t, c)(presetOptions) : undefined;
        const modules = [...new Set([...(presetRunner.modules || []), ...(externalPresetRunner?.modules || [])])];
        if (modules.length > 0) {
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
      options.projectName ? displayModuleListRule({ packageName: options.projectName }) : noop()
    ]);
  };
}

/**
 * Add Otter library to an Angular Project
 * @param options
 */
export const ngAdd = createOtterSchematic(ngAddFn);
