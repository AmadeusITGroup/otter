import type {
  Message,
} from '@amadeus-it-group/microfrontends';

/** the error message type */
export const ERROR_MESSAGE_TYPE = 'error';

/**
 * The possible reasons for an error.
 */
export type ErrorReason = 'unknown_type' | 'version_mismatch' | 'internal_error';

/**
 * The content of an error message.
 * @template S - The type of the source message.
 */
export interface ErrorContent<S extends Message = Message> {
  /** The reason for the error */
  reason: ErrorReason;
  /** The source message that caused the error */
  source: S;
}
