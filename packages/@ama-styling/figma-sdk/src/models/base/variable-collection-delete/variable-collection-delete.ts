/**
 * Model: VariableCollectionDelete
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */



/**
 * An object that contains details about deleting a `VariableCollection`.
 */
export interface VariableCollectionDelete {
  /** The action to perform for the variable collection. */
  action: ActionEnum;
  /** The id of the variable collection to delete. */
  id: string;
}

export type ActionEnum = 'DELETE';

