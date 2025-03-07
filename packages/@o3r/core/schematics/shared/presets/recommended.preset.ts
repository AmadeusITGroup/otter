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
    options.isUsingEslintLegacy ? '@o3r/eslint-config-otter' : '@o3r/eslint-config',
    '@o3r/testing'
  ];

  return {
    modules,
    rule: defaultPresetRuleFactory(modules, options)
  };
}
