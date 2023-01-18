import {JsonObject} from '@angular-devkit/core';

/**
 * Properties associated to an Otter simple sync store
 */
export interface NgGenerateSimpleSyncStoreSchematicsSchema extends JsonObject {
  /** Directory containing the stores */
  path: string | null;

  /** Project name */
  projectName: string | null;

  /** Store name */
  storeName: string;

  /** Skip the linter process */
  skipLinter: boolean;
}
