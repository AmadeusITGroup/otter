/**
 * Model: ConditionalBlock
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { Action } from '../action';
import { VariableData } from '../variable-data';

/**
 * Either the if or else conditional blocks. The if block contains a condition to check. If that condition is met then it will run those list of actions, else it will run the actions in the else block.
 */
export interface ConditionalBlock {
  /** @see VariableData */
  condition?: VariableData;
  /** List of Actions */
  actions: Action[];
}


