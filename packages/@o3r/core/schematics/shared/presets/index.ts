import {
  allPreset
} from './all.preset';
import {
  basicPreset
} from './basic.preset';
import {
  cmsPreset
} from './cms.preset';
import type {
  Presets
} from './preset.interface';

export * from './external.preset';
export * from './preset.interface';

export const presets: Presets = {
  basic: basicPreset,
  cms: cmsPreset,
  all: allPreset
};
