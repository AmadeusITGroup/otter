import type { JsonObject } from '@angular-devkit/core';

export interface NgGenerateStoreActionSchematicsSchema extends JsonObject {
  /** Project name */
  projectName: string | null;

  /** Name of the Store in which to add the new action */
  storeName: string;

  /** Name of the action to create */
  actionName: string;

  /** The type of the action to create */
  actionType: 'set' | 'set-entities' | 'upsert-entities' | 'update' | 'update-entities' | 'fail' | 'clear' | '-custom-';

  /** Determine if the action is an HTTP call */
  isCallAction: boolean;

  /** Directory containing the stores */
  storeDirectory: string | null;

  /** Description of the action */
  description: string | null;

  /** Skip the linter process */
  skipLinter: boolean;
}
