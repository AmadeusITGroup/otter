/**
 * Model: Expression
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { ExpressionFunction } from '../expression-function';
import { VariableData } from '../variable-data';

/**
 * Defines the [Expression](https://help.figma.com/hc/en-us/articles/15253194385943) object, which contains a list of `VariableData` objects strung together by operators (`ExpressionFunction`).
 */
export interface Expression {
  /** @see ExpressionFunction */
  expressionFunction: ExpressionFunction;
  /** List of VariableDatas */
  expressionArguments: VariableData[];
}


