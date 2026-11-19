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

/** Array of TypeEnum items */
export const LIST_TYPE_ENUM = ['SET_VARIABLE_MODE'] as const;

/** List of available values for TypeEnum */
export type TypeEnum = 'SET_VARIABLE_MODE';

