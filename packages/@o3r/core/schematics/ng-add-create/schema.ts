import { JsonObject } from '@angular-devkit/core';

export interface NgGenerateUpdateSchematicsSchema extends JsonObject {
  /** Project name */
  projectName: string | null;

  /** Source directory containing the schematics */
  path: string | null;

}
