import type {
  ErrorMessageV1_0,
} from './error.versions';

export * from './base';
export * from './error.versions';

/** The versions available for error messages */
export type ErrorMessage = ErrorMessageV1_0;
