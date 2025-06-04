/**
 * Model: GetActivityLogs429Response
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */



export interface GetActivityLogs429Response {
  /** For erroneous requests, this value is always `true`. */
  error: boolean;
  /** Status code */
  status: StatusEnum;
  /** A string describing the error */
  message: string;
}

export type StatusEnum = '429';

