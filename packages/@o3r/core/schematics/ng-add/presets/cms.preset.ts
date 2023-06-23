import { chain } from '@angular-devkit/schematics';
import { defaultPresetRuleFactory } from './helpers';
import type { Preset } from './preset.interface';
import { setupSchematicsDefaultParams, WorkspaceSchematics } from '@o3r/schematics';

const modules = [
  '@o3r/localization',
  '@o3r/styling',
  '@o3r/components',
  '@o3r/configuration',
  '@o3r/dynamic-content',
  '@o3r/rules-engine'
];

/**
 * Preset Installing the minimum modules to fully administrated the application via CMS
 */
export const cmsPreset: Preset = {
  modules,
  rule: (options) => {
    return chain([
      // eslint-disable-next-line @typescript-eslint/naming-convention
      setupSchematicsDefaultParams({ '*:ng-add': { enableMetadataExtract: true } } as WorkspaceSchematics),
      defaultPresetRuleFactory(modules)(options)
    ]);
  }
};
