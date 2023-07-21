import type { JsonObject } from '@angular-devkit/core';
import type { PresetNames } from '../ng-add/schema';

export interface NgAddModulesSchematicsSchema extends JsonObject {
  /** reset of module list to automatically install */
  preset: PresetNames | 'none';
}
