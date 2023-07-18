import type { Rule } from '@angular-devkit/schematics';
import type { PresetNames } from '../schema';
import type { JsonObject } from '@angular-devkit/core';

/** Options of the preset runner  */
export interface PresetOptions {
  /** Options to forward to the executed schematics */
  forwardOptions?: JsonObject;
}

/** Definition of the modules preset */
export interface Preset {
  /** List of installed modules by the preset */
  modules?: string[];

  /** Rule to apply for the specific preset */
  rule: (options: PresetOptions) => Rule;
}

export type Presets = { [x in PresetNames]: Preset };
