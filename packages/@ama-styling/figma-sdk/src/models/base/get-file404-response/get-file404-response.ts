/**
 * Model: GetFile404Response
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */



export interface GetFile404Response {
  /** Status code */
  status: StatusEnum;
  /** A string describing the error */
  err: string;
}

/** Array of StatusEnum items */
export const LIST_STATUS_ENUM = ['404'] as const;

/** List of available values for StatusEnum */
export type StatusEnum = '404';

