/**
 * Model: VariableData
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { VariableDataType } from '../variable-data-type';
import { VariableDataValue } from '../variable-data-value';
import { VariableResolvedDataType } from '../variable-resolved-data-type';

/**
 * A value to set a variable to during prototyping.
 */
export interface VariableData {
  /** @see VariableDataType */
  type?: VariableDataType;
  /** @see VariableResolvedDataType */
  resolvedType?: VariableResolvedDataType;
  /** @see VariableDataValue */
  value?: VariableDataValue;
}


