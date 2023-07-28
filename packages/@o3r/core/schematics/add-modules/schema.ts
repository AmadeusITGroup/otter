import type { SchematicOptionObject } from '@o3r/schematics';
import type { PresetNames } from '../ng-add/schema';

export interface NgAddModulesSchematicsSchema extends SchematicOptionObject {
  /** reset of module list to automatically install */
  preset: PresetNames | 'none';
}
