import type { SchematicOptionObject } from '@o3r/schematics';

export interface NgShowModulesSchematicsSchema extends SchematicOptionObject {
  /** Display only the modules with CMS administration */
  cmsOnly: boolean;
  /** Display only the modules that are not already installed */
  hideInstalledModule: boolean;
}
