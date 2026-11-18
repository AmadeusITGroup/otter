/**
 * Model: DeleteWebhook500Response
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */



export interface DeleteWebhook500Response {
  /** For erroneous requests, this value is always `true`. */
  error: boolean;
  /** Status code */
  status: StatusEnum;
  /** A string describing the error */
  message: string;
}

/** Array of StatusEnum items */
export const LIST_STATUS_ENUM = ['500'] as const;

/** List of available values for StatusEnum */
export type StatusEnum = '500';

