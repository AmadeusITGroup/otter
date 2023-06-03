import type { JsonObject } from '@angular-devkit/core';

export interface NgShowModulesSchematicsSchema extends JsonObject {
  /** Display only the modules with CMS administration */
  cmsOnly: boolean;
  /** Display only the modules that are not already installed */
  hideInstalledModule: boolean;
}
