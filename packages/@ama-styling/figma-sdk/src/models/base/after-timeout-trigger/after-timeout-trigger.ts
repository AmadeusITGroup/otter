/**
 * Model: AfterTimeoutTrigger
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */



export interface AfterTimeoutTrigger {
  /** @see TypeEnum */
  type: TypeEnum;
  timeout: number;
}

/** Array of TypeEnum items */
export const LIST_TYPE_ENUM = ['AFTER_TIMEOUT'] as const;

/** List of available values for TypeEnum */
export type TypeEnum = 'AFTER_TIMEOUT';

