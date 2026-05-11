/**
 * Information about user activity received from another context
 */
export interface ActivityInfo {
  /** The channel ID (source ID) that sent the activity */
  channelId: string;
  /** The type of activity event */
  eventType: string;
  /** Timestamp when the activity occurred */
  timestamp: number;
}

/**
 * Configuration options for the activity producer service
 */
export interface ActivityProducerConfig {
  /**
   * Minimum interval in milliseconds between activity messages sent to the consumer.
   * When multiple events occur within this interval, only the first one triggers a message.
   * This prevents flooding the communication channel with too many messages.
   */
  throttleMs: number;
  /**
   * Optional filter function to determine if an event should be broadcast to the host(shell) app.
   * Return true to broadcast the event, false to ignore it.
   * Useful for filtering out events that occur on specific elements (e.g., iframes handled separately).
   * @param event The DOM event that triggered the activity
   * @returns Whether the event should be broadcast
   */
  shouldBroadcast?: (event: Event) => boolean;
  /**
   * Enable tracking of nested iframes. When enabled, the service will detect when focus
   * moves to an iframe within the document and send periodic activity signals while
   * the iframe has focus. This is useful for modules that contain iframes whose content
   * cannot be modified to include activity tracking.
   */
  trackNestedIframes?: boolean;
  /**
   * Interval in milliseconds for polling document.activeElement to detect iframe focus.
   * Only used when trackNestedIframes is true.
   * @default 1000
   */
  nestedIframePollIntervalMs?: number;
  /**
   * Interval in milliseconds for sending activity signals to the host(shell) app while a nested iframe has focus.
   * Only used when trackNestedIframes is true.
   * @default 30000
   */
  nestedIframeActivityEmitIntervalMs?: number;
  /**
   * Throttle time in milliseconds for high-frequency events (scroll, mousemove).
   * These events are throttled to avoid performance issues.
   * @default 300
   */
  highFrequencyThrottleMs?: number;
}

/**
 * Configuration for the iframe activity tracker
 */
export interface IframeActivityTrackerConfig {
  /**
   * Interval in milliseconds for polling document.activeElement to detect iframe focus.
   * @default 1000
   */
  pollIntervalMs?: number;
  /**
   * Interval in milliseconds for sending activity signals to the host(shell) app while an iframe has focus.
   * @default 30000
   */
  activityIntervalMs?: number;
  /**
   * Callback to invoke when activity is detected
   */
  onActivity: () => void;
}
