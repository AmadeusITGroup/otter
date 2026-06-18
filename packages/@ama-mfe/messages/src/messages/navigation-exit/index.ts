import type {
  NavigationBlockStateV1_0,
} from './navigation-block-state-versions';
import type {
  NavigationDecisionV1_0,
} from './navigation-decision-versions';
import type {
  NavigationRequestV1_0,
} from './navigation-request-versions';

export * from './base';
export * from './navigation-block-state-versions';
export * from './navigation-decision-versions';
export * from './navigation-request-versions';

/** All supported versions of the navigation block state message. */
export type NavigationBlockStateMessage = NavigationBlockStateV1_0;
/** All supported versions of the navigation request message. */
export type NavigationRequestMessage = NavigationRequestV1_0;
/** All supported versions of the navigation decision message. */
export type NavigationDecisionMessage = NavigationDecisionV1_0;
