import type { JsonObject } from '@angular-devkit/core';

export interface NgGenerateStorybookComponentSchematicsSchema extends JsonObject {
  /** Project name */
  projectName: string | null;

  /** Component to which the story will be associated */
  relativePathToComponentDir: string;
}
