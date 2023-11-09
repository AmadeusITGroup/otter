import type { SchematicOptionObject } from '@o3r/schematics';
import type { PresetNames } from '../ng-add/schema';

export interface NgAddModulesSchematicsSchema extends SchematicOptionObject {
  /** Project name */
  projectName?: string | undefined;

  /** reset of module list to automatically install */
  preset?: PresetNames | undefined;

  /** Preset of non-official module list to automatically install */
  externalPresets?: string | undefined;
}
