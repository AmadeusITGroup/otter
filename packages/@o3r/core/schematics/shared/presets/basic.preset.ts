import { defaultPresetRuleFactory } from './helpers';
import type { Preset } from './preset.interface';

/**
 * Default preset with the basic of Otter Framework (no additional modules)
 */
export const basicPreset: Preset = {
  rule: defaultPresetRuleFactory([])
};
