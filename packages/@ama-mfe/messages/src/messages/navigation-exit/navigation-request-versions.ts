import type {
  VersionedNavigationRequestMessage,
} from './base';

/** Navigation request content for version 1.0 */
export interface NavigationRequestContentV1_0 {
  /** Unique id used to correlate the request with the shell's decision. */
  correlationId: string;
  /** Optional human-readable reason displayed in the confirmation modal. */
  reason?: string;
}

/**
 * Sent by a module that wants to navigate while its navigation block state is `blocked`.
 * The shell responds by opening the confirmation modal and then sending back a `navigation-decision` message with the same `correlationId`.
 */
export interface NavigationRequestV1_0 extends NavigationRequestContentV1_0, VersionedNavigationRequestMessage<'1.0'> {}
