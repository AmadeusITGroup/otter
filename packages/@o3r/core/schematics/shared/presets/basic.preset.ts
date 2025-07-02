import {
  defaultPresetRuleFactory,
} from './helpers';

/**
 * Default preset with the basic of Otter Framework (no additional modules)
 */
export function basicPreset() {
  return {
    rule: defaultPresetRuleFactory([])
  };
}
