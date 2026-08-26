import type {
  StrictTypedVersionedMessage,
} from '../core';

/**
 * Eager state-sync message: a module reports its current navigation block state
 * so the shell mirror stays up to date without a round-trip.
 */
export const NAVIGATION_BLOCK_STATE_MESSAGE_TYPE = 'navigation-block-state';

/**
 * Negotiation request: the sender asks the peer to perform any work required before a navigation
 * and then acknowledge with a `navigation-decision`.
 * Used in both directions (module → shell, and shell → module) with a correlation id to match replies.
 */
export const NAVIGATION_REQUEST_MESSAGE_TYPE = 'navigation-request';

/**
 * Negotiation reply: answer to a previously received `navigation-request`, carrying the same `correlationId`.
 * Used in both directions.
 */
export const NAVIGATION_DECISION_MESSAGE_TYPE = 'navigation-decision';

/** Versioned navigation block state message */
export interface VersionedNavigationBlockStateMessage<V extends string> extends StrictTypedVersionedMessage<V, typeof NAVIGATION_BLOCK_STATE_MESSAGE_TYPE> {}

/** Versioned navigation request message */
export interface VersionedNavigationRequestMessage<V extends string> extends StrictTypedVersionedMessage<V, typeof NAVIGATION_REQUEST_MESSAGE_TYPE> {}

/** Versioned navigation decision message */
export interface VersionedNavigationDecisionMessage<V extends string> extends StrictTypedVersionedMessage<V, typeof NAVIGATION_DECISION_MESSAGE_TYPE> {}
