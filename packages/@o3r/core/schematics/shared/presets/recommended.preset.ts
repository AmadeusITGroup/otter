import {
  chain,
  type Tree,
} from '@angular-devkit/schematics';
import {
  setupSchematicsParamsForProject,
  type WorkspaceSchematics,
} from '@o3r/schematics';
import {
  isUsingLegacyConfig,
} from '../../ng-add/utils';
import {
  defaultPresetRuleFactory,
} from './helpers';
import type {
  PresetOptions,
} from './preset.interface';

/**
 * Preset with Otter recommended modules
 * @param options
 * @param tree
 */
export function recommendedPreset(options: PresetOptions, tree: Tree) {
  const modules = [
    isUsingLegacyConfig(tree) ? '@o3r/eslint-config-otter' : '@o3r/eslint-config'
  ];

  const rule = defaultPresetRuleFactory(modules, options);

  return {
    modules,
    rule: chain([
      setupSchematicsParamsForProject({ '*:ng-add': { enableMetadataExtract: true } } as WorkspaceSchematics, options.projectName),
      rule
    ])
  };
}
