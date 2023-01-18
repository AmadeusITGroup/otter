import { JsonObject } from '@angular-devkit/core';

export interface CreateModuleSchematicsSchema extends JsonObject {
  /** Project name */
  name: string;

  /** Path where generate the repository */
  basePath: string;
}
