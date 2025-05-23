/**
 * Model: SetVariableModeAction
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */



/**
 * Sets a variable to a specific mode.
 */
export interface SetVariableModeAction {
  /** @see TypeEnum */
  type: TypeEnum;
  variableCollectionId?: string;
  variableModeId?: string;
}

export type TypeEnum = 'SET_VARIABLE_MODE';

