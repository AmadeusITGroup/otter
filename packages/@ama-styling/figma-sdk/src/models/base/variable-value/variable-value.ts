/**
 * Model: VariableValue
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { RGB } from '../r-g-b';
import { RGBA } from '../r-g-b-a';
import { VariableAlias } from '../variable-alias';

/**
 * The value for the variable. The value must match the variable's type. If setting to a variable alias, the alias must resolve to this type.
 */
export type VariableValue = RGB | RGBA | VariableAlias | boolean | number | string;

export type TypeEnum = 'VARIABLE_ALIAS';

