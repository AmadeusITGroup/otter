import { defaultPresetRuleFactory } from './helpers';
import type { Preset } from './preset.interface';

/**
 * Default preset with the basic of Otter Framework (no additional modules)
 */
export const basicPreset: Preset = {
  modules: [],
  rule: defaultPresetRuleFactory([])
};
