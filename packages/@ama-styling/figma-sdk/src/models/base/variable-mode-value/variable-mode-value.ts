/**
 * Model: VariableModeValue
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { VariableValue } from '../variable-value';

/**
 * An object that represents a value for a given mode of a variable. All properties are required.
 */
export interface VariableModeValue {
  /** The target variable. You can use the temporary id of a variable. */
  variableId: string;
  /** Must correspond to a mode in the variable collection that contains the target variable. */
  modeId: string;
  /** @see VariableValue */
  value: VariableValue;
}


