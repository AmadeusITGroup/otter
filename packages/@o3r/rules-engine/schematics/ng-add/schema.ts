import type { JsonObject } from '@angular-devkit/core';

export interface NgAddSchematicsSchema extends JsonObject {
  /** Project name */
  projectName: string | null;

  /** Activate metadata extraction */
  enableMetadataExtract: boolean;
}
