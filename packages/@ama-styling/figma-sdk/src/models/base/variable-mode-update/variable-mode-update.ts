/**
 * Model: VariableModeUpdate
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */



/**
 * An object that contains details about updating a `VariableMode`.
 */
export interface VariableModeUpdate {
  /** The action to perform for the variable mode. */
  action: ActionEnum;
  /** The id of the variable mode to update. */
  id: string;
  /** The name of this variable mode. */
  name?: string;
  /** The variable collection that contains the mode. */
  variableCollectionId: string;
}

export type ActionEnum = 'UPDATE';

