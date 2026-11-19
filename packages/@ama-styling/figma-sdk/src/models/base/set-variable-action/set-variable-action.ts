/**
 * Model: SetVariableAction
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { VariableData } from '../variable-data';

/**
 * Sets a variable to a specific value.
 */
export interface SetVariableAction {
  /** @see TypeEnum */
  type: TypeEnum;
  variableId: string;
  /** @see VariableData */
  variableValue?: VariableData;
}

/** Array of TypeEnum items */
export const LIST_TYPE_ENUM = ['SET_VARIABLE'] as const;

/** List of available values for TypeEnum */
export type TypeEnum = 'SET_VARIABLE';

