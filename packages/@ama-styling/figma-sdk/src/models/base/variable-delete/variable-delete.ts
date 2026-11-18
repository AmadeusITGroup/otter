/**
 * Model: VariableDelete
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */



/**
 * An object that contains details about deleting a `Variable`.
 */
export interface VariableDelete {
  /** The action to perform for the variable. */
  action: ActionEnum;
  /** The id of the variable to delete. */
  id: string;
}

/** Array of ActionEnum items */
export const LIST_ACTION_ENUM = ['DELETE'] as const;

/** List of available values for ActionEnum */
export type ActionEnum = 'DELETE';

