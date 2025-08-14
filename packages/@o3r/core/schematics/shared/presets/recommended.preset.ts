import {
  defaultPresetRuleFactory,
} from './helpers';
import type {
  PresetOptions,
} from './preset.interface';

/**
 * Preset with Otter recommended modules
 * @param options
 */
export function recommendedPreset(options: PresetOptions) {
  const modules = [
    '@o3r/eslint-config'
  ];

  return {
    modules,
    rule: defaultPresetRuleFactory(modules, options)
  };
}
