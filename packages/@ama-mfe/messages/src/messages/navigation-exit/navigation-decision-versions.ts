import type {
  VersionedNavigationDecisionMessage,
} from './base';

/** Navigation decision content for version 1.0 */
export interface NavigationDecisionContentV1_0 {
  /** Correlation id echoing the originating `navigation-request`. */
  correlationId: string;
  /** `true` when the user confirmed the navigation, `false` when they cancelled. */
  proceed: boolean;
}

/**
 * Sent by the shell in response to a `navigation-request` message.
 * Carries the user's decision (proceed or cancel) and the `correlationId` from the original request
 * so the module can resolve the pending navigation.
 */
export interface NavigationDecisionV1_0 extends NavigationDecisionContentV1_0, VersionedNavigationDecisionMessage<'1.0'> {}
