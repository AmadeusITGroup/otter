/**
 * Model: VariableModeDelete
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */



/**
 * An object that contains details about deleting a `VariableMode`.
 */
export interface VariableModeDelete {
  /** The action to perform for the variable mode. */
  action: ActionEnum;
  /** The id of the variable mode to delete. */
  id: string;
}

/** Array of ActionEnum items */
export const LIST_ACTION_ENUM = ['DELETE'] as const;

/** List of available values for ActionEnum */
export type ActionEnum = 'DELETE';

