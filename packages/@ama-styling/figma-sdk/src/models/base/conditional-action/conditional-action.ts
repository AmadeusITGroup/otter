/**
 * Model: ConditionalAction
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { ConditionalBlock } from '../conditional-block';

/**
 * Checks if a condition is met before performing certain actions by using an if/else conditional statement.
 */
export interface ConditionalAction {
  /** @see TypeEnum */
  type: TypeEnum;
  /** List of ConditionalBlocks */
  conditionalBlocks: ConditionalBlock[];
}

/** Array of TypeEnum items */
export const LIST_TYPE_ENUM = ['CONDITIONAL'] as const;

/** List of available values for TypeEnum */
export type TypeEnum = 'CONDITIONAL';

