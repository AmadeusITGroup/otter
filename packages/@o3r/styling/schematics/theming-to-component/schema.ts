import type { JsonObject } from '@angular-devkit/core';

export interface NgAddThemingSchematicsSchema extends JsonObject {
  /** Path to the component's style file */
  path: string;
}
