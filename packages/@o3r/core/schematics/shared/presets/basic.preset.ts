import { defaultPresetRuleFactory } from './helpers';
import type { PresetFactory } from './preset.interface';

/**
 * Default preset with the basic of Otter Framework (no additional modules)
 */
export const basicPreset: PresetFactory = () => ({
  rule: defaultPresetRuleFactory([])
});
