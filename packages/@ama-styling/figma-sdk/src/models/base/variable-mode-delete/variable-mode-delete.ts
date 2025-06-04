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

export type ActionEnum = 'DELETE';

