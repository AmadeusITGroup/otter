/**
 * Model: DeleteComment200Response
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */



export interface DeleteComment200Response {
  /** The status of the request. */
  status: StatusEnum;
  /** For successful requests, this value is always `false`. */
  error: boolean;
}

/** Array of StatusEnum items */
export const LIST_STATUS_ENUM = ['200'] as const;

/** List of available values for StatusEnum */
export type StatusEnum = '200';

