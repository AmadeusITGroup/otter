import type {
  UserActivityEventType,
} from '@ama-mfe/messages';
import type {
  ActivityProducerConfig,
} from './interfaces';

/**
 * DOM events that indicate user activity
 */
export const ACTIVITY_EVENTS: readonly Exclude<UserActivityEventType, 'visibilitychange'>[] = [
  'click',
  'keydown',
  'scroll',
  'touchstart',
  'focus'
];

/**
 * Custom activity event type for iframe interactions.
 * Emitted programmatically when an iframe gains focus, not from a DOM event listener.
 */
export const IFRAME_INTERACTION_EVENT: UserActivityEventType = 'iframeinteraction';

/**
 * Custom activity event type for visibility changes.
 * Emitted programmatically when the document becomes visible, not from a DOM event listener.
 */
export const VISIBILITY_CHANGE_EVENT: UserActivityEventType = 'visibilitychange';

/**
 * High-frequency events that require throttling to avoid performance issues
 */
export const HIGH_FREQUENCY_EVENTS: readonly UserActivityEventType[] = [
  'scroll'
];

/**
 * Default configuration values for the ActivityProducerService
 */
export const DEFAULT_ACTIVITY_PRODUCER_CONFIG: Readonly<ActivityProducerConfig> = {
  /** Default throttle time in milliseconds between activity messages */
  throttleMs: 1000,
  /** Default throttle time in milliseconds for high-frequency events */
  highFrequencyThrottleMs: 300,
  /** Whether to track nested iframes by default */
  trackNestedIframes: false,
  /** Default interval for iframe activity signals (30 seconds) */
  nestedIframeActivityEmitIntervalMs: 30_000,
  /** Default polling interval for detecting iframe focus changes (1 second) */
  nestedIframePollIntervalMs: 1000
};
