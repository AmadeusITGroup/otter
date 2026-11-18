/**
 * Model: TriggerOneOf
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */



export interface TriggerOneOf {
  /** @see TypeEnum */
  type: TypeEnum;
}

/** Array of TypeEnum items */
export const LIST_TYPE_ENUM = ['ON_CLICK', 'ON_HOVER', 'ON_PRESS', 'ON_DRAG'] as const;

/** List of available values for TypeEnum */
export type TypeEnum = 'ON_CLICK' | 'ON_HOVER' | 'ON_PRESS' | 'ON_DRAG';

