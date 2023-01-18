import type { JsonObject } from '@angular-devkit/core';

export interface NgGeneratePlaywrightSanitySchematicsSchema extends JsonObject {
  /** Project name */
  projectName: string | null;

  /** Page name */
  name: string;

  /** Directory containing the playwright sanity */
  path: string | null;
}
