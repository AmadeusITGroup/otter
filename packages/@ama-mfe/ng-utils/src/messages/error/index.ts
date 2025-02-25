import type {
  ErrorMessage as ErrorMessageV1_0,
} from './error.1.0';

export * from './base';
export { ErrorMessage as ErrorMessageV1_0 } from './error.1.0';

/** The versions available for error messages */
export type ErrorVersions = ErrorMessageV1_0;
