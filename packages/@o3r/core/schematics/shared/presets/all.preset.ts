import { chain } from '@angular-devkit/schematics';
import { defaultPresetRuleFactory } from './helpers';
import type { PresetOptions } from './preset.interface';
import { setupSchematicsDefaultParams, WorkspaceSchematics } from '@o3r/schematics';

/**
 * Preset Installing all the Otter modules
 * @param options
 */
export function allPreset(options: PresetOptions) {
  const modules = [
    '@o3r/analytics',
    '@o3r/apis-manager',
    '@o3r/application',
    '@o3r/components',
    '@o3r/configuration',
    '@o3r/design',
    '@o3r/dynamic-content',
    '@o3r/eslint-config-otter',
    '@o3r/eslint-plugin',
    '@o3r/forms',
    '@o3r/localization',
    '@o3r/logger',
    '@o3r/rules-engine',
    '@o3r/store-sync',
    '@o3r/stylelint-plugin',
    '@o3r/styling'
  ];

  const rule = defaultPresetRuleFactory(modules, options);

  return {
    modules,
    rule: chain([
      // eslint-disable-next-line @typescript-eslint/naming-convention
      setupSchematicsDefaultParams({ '*:ng-add': { enableMetadataExtract: true } } as WorkspaceSchematics),
      rule
    ])
  };
}
