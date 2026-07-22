import type {
  StrictTypedVersionedMessage,
} from '../core';

/** The navigation message type used at communication with iframes */
export const NAVIGATION_MESSAGE_TYPE = 'navigation';

/** Versioned navigation message */
export interface VersionedNavigationMessage<V extends string> extends StrictTypedVersionedMessage<V, typeof NAVIGATION_MESSAGE_TYPE> {}
