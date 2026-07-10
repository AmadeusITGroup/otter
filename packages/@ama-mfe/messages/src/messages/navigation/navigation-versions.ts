import type {
  VersionedNavigationMessage,
} from './base';

/** Navigation content for version 1.0 */
export interface NavigationContentV1_0 {
  /** The url updated */
  url: string;
}

/**
 * The navigation message object sent via the communication protocol.
 * Used in microfrontend architecture based on iframes where an iframe change its url and notify its parent with the url change
 * The parent should update its own url with the information received in order to allow the refresh and the deep link share
 */
export interface NavigationV1_0 extends NavigationContentV1_0, VersionedNavigationMessage<'1.0'> {}

/** Navigation content for version 1.1 */
export interface NavigationContentV1_1 extends NavigationContentV1_0 {
  /** Subset of NavigationExtras forwarded across the iframe boundary. */
  extras?: {
    /** Navigate while replacing the current history entry instead of pushing a new one. */
    replaceUrl?: boolean;
  };
}

/**
 * The navigation message object sent via the communication protocol.
 * Carries a subset of NavigationExtras alongside the updated url so the receiving router
 * can reproduce the original history/location semantics (e.g. skipping a route from history).
 */
export interface NavigationV1_1 extends NavigationContentV1_1, VersionedNavigationMessage<'1.1'> {}
