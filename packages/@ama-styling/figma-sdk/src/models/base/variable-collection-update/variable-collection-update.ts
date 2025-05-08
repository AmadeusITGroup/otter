/**
 * Model: VariableCollectionUpdate
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */



/**
 * An object that contains details about updating a `VariableCollection`.
 */
export interface VariableCollectionUpdate {
  /** The action to perform for the variable collection. */
  action: ActionEnum;
  /** The id of the variable collection to update. */
  id: string;
  /** The name of this variable collection. */
  name?: string;
  /** Whether this variable collection is hidden when publishing the current file as a library. */
  hiddenFromPublishing?: boolean;
}

export type ActionEnum = 'UPDATE';

