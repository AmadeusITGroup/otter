/**
 * Model: VariableDataValue
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { Expression } from '../expression';
import { RGB } from '../r-g-b';
import { RGBA } from '../r-g-b-a';
import { VariableAlias } from '../variable-alias';

export type VariableDataValue = Expression | RGB | RGBA | VariableAlias | boolean | number | string;

export type TypeEnum = 'VARIABLE_ALIAS';

