import type {
  SchematicOptionObject
} from '@o3r/schematics';

export interface NgGenerateStoreActionSchematicsSchema extends SchematicOptionObject {
  /** Project name */
  projectName?: string | undefined;

  /** Name of the Store in which to add the new action */
  storeName: string;

  /** Name of the action to create */
  actionName: string;

  /** The type of the action to create */
  actionType: 'set' | 'set-entities' | 'upsert-entities' | 'update' | 'update-entities' | 'fail' | 'clear' | '-custom-';

  /** Determine if the action is an HTTP call */
  isCallAction: boolean;

  /** Directory containing the stores */
  storeDirectory?: string | undefined;

  /** Description of the action */
  description?: string | undefined;

  /** Skip the linter process */
  skipLinter: boolean;
}
