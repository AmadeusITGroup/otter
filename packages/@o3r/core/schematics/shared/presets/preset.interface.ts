import type { Rule } from '@angular-devkit/schematics';
import type { PresetNames } from '../../ng-add/schema';
import type { SchematicOptionObject, SetupDependenciesOptions } from '@o3r/schematics';

/** Options of the preset runner  */
export interface PresetOptions {
  /** Project name */
  projectName?: string | undefined;

  /** Options to forward to the executed schematics */
  forwardOptions?: SchematicOptionObject;

  /** Option to provide to the dependency setup helper */
  dependenciesSetupConfig?: SetupDependenciesOptions;
}

/** Definition of the modules preset */
export interface Preset {
  /** List of installed modules by the preset */
  modules?: string[];

  /** Rule to apply for the specific preset */
  rule: Rule;
}

/** Preset factory call when a preset has been selected */
export type PresetFactory = (options: PresetOptions) => Promise<Preset> | Preset;

/** Preset list */
export type Presets = { [x in PresetNames]: PresetFactory };
