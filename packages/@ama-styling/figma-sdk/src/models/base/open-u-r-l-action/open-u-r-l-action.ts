/**
 * Model: OpenURLAction
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */



/**
 * An action that opens a URL.
 */
export interface OpenURLAction {
  /** @see TypeEnum */
  type: TypeEnum;
  url: string;
}

/** Array of TypeEnum items */
export const LIST_TYPE_ENUM = ['URL'] as const;

/** List of available values for TypeEnum */
export type TypeEnum = 'URL';

