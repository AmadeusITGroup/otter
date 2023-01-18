import {JsonObject} from '@angular-devkit/core';

export interface NgGenerateServiceSchematicsSchema extends JsonObject {
  /** Project name */
  projectName: string | null;

  /** Service name */
  name: string;

  /** Name of the service feature */
  featureName: string;

  /** Directory containing the services */
  path: string | null;

  /** Skip the linter process */
  skipLinter: boolean;
}
