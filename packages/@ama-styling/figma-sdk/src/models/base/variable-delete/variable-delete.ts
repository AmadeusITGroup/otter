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

export type ActionEnum = 'DELETE';

