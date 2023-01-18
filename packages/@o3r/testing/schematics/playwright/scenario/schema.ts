import { JsonObject } from '@angular-devkit/core';

export interface NgGeneratePlaywrightScenarioSchematicsSchema extends JsonObject {
  /** Project name */
  projectName: string | null;

  /** Page name */
  name: string;

  /** Directory containing the playwright scenarios */
  path: string | null;
}
