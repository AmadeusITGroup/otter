/**
 * Model: VariableModeCreate
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */



/**
 * An object that contains details about creating a `VariableMode`.
 */
export interface VariableModeCreate {
  /** The action to perform for the variable mode. */
  action: ActionEnum;
  /** A temporary id for this variable mode. */
  id?: string;
  /** The name of this variable mode. */
  name: string;
  /** The variable collection that will contain the mode. You can use the temporary id of a variable collection. */
  variableCollectionId: string;
}

export type ActionEnum = 'CREATE';

