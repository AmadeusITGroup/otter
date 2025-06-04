/**
 * Model: ErrorResponsePayloadWithErrorBoolean
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */



/**
 * A response indicating an error occurred.
 */
export interface ErrorResponsePayloadWithErrorBoolean {
  /** For erroneous requests, this value is always `true`. */
  error: boolean;
  /** Status code */
  status: number;
  /** A string describing the error */
  message: string;
}


