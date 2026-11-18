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

/** Array of ActionEnum items */
export const LIST_ACTION_ENUM = ['DELETE'] as const;

/** List of available values for ActionEnum */
export type ActionEnum = 'DELETE';

