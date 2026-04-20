import {
  USER_ACTIVITY_MESSAGE_TYPE,
  type UserActivityEventType,
  type UserActivityMessage,
  type UserActivityMessageV1_0,
} from '@ama-mfe/messages';
import {
  afterNextRender,
  DestroyRef,
  inject,
  Injectable,
  signal,
} from '@angular/core';
import {
  LoggerService,
} from '@o3r/logger';
import {
  ConnectionService,
} from '../connect/index';
import {
  type MessageProducer,
  registerProducer,
} from '../managers';
import type {
  ErrorContent,
} from '../messages';
import {
  ACTIVITY_EVENTS,
  DEFAULT_ACTIVITY_PRODUCER_CONFIG,
  HIGH_FREQUENCY_EVENTS,
  IFRAME_INTERACTION_EVENT,
  VISIBILITY_CHANGE_EVENT,
} from './config';
import {
  IframeActivityTrackerService,
} from './iframe-activity-tracker.service';
import type {
  ActivityInfo,
  ActivityProducerConfig,
} from './interfaces';

/**
 * Generic service that tracks user activity and sends messages.
 * Can be configured for different contexts (cockpit or modules) via start() method parameter.
 */
@Injectable({
  providedIn: 'root'
})
export class ActivityProducerService implements MessageProducer<UserActivityMessage> {
  private readonly messageService = inject(ConnectionService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly iframeActivityTracker = inject(IframeActivityTrackerService);
  private readonly logger = inject(LoggerService);

  /**
   * Timestamp of the last sent activity message
   */
  private lastSentTimestamp = 0;

  /**
   * Bound event listeners for cleanup
   */
  private readonly boundListeners = new Map<UserActivityEventType, EventListener>();

  /**
   * Last emission timestamps for throttled high-frequency events
   */
  private readonly lastEmitTimestamps = new Map<UserActivityEventType, number>();

  /**
   * Whether the service has been started
   */
  private started = false;

  /**
   * Signal that emits local activity information.
   * This allows consumers to react to activity detected by this producer.
   */
  private readonly localActivityWritable = signal<ActivityInfo | undefined>(undefined);

  /**
   * Read-only signal containing the latest local activity info.
   * Use this signal to react to locally detected activity.
   */
  public readonly localActivity = this.localActivityWritable.asReadonly();

  /**
   * @inheritdoc
   */
  public readonly types = USER_ACTIVITY_MESSAGE_TYPE;

  constructor() {
    registerProducer(this);
    this.destroyRef.onDestroy(() => this.stop());
  }

  /**
   * Checks if a high-frequency event should be processed based on throttle timing.
   * This is called before shouldBroadcast to avoid expensive filter operations on every event.
   * @param eventType The type of activity event
   * @param throttleMs The throttle interval in milliseconds
   * @returns true if the event should be processed, false if it should be skipped
   */
  private shouldProcessHighFrequencyEvent(eventType: UserActivityEventType, throttleMs: number): boolean {
    const now = Date.now();
    const lastEmit = this.lastEmitTimestamps.get(eventType) ?? 0;

    if (now - lastEmit >= throttleMs) {
      this.lastEmitTimestamps.set(eventType, now);
      return true;
    }
    return false;
  }

  /**
   * Handles activity by sending a throttled message and emitting to local signal.
   * @param eventType The type of activity event that occurred
   * @param configObject
   */
  private onActivity(eventType: UserActivityEventType, configObject: ActivityProducerConfig): void {
    const now = Date.now();

    // Always emit local activity signal (not throttled for local detection)
    this.localActivityWritable.set({
      channelId: 'local',
      eventType,
      timestamp: now
    });

    // Send message with throttling
    if (now - this.lastSentTimestamp >= configObject.throttleMs) {
      this.lastSentTimestamp = now;
      this.sendActivityMessage(eventType, now);
    }
  }

  /**
   * Sends an activity message.
   * @param eventType The type of activity event
   * @param timestamp The timestamp of the event
   */
  private sendActivityMessage(eventType: UserActivityEventType, timestamp: number): void {
    const message: UserActivityMessageV1_0 = {
      type: USER_ACTIVITY_MESSAGE_TYPE,
      version: '1.0',
      eventType,
      timestamp
    };
    const registeredPeersIdsForUserActivity = [...this.messageService.knownPeers.entries()]
      .filter(([peerId]) => peerId !== this.messageService.id)
      .filter(([, messages]) => messages.some((msg) => msg.type === USER_ACTIVITY_MESSAGE_TYPE))
      .map((peer) => peer[0]);
    // send messages to the peers waiting for user activity
    // avoids sending the message to modules which are not using it
    if (registeredPeersIdsForUserActivity.length > 0) {
      this.messageService.send(message, { to: registeredPeersIdsForUserActivity });
    }
  }

  /**
   * @inheritdoc
   */
  public handleError(message: ErrorContent<UserActivityMessage>): void {
    this.logger.error('Error in user activity service message', message);
  }

  /**
   * Starts observing user activity events.
   * When activity is detected, it sends a throttled message.
   * Event listeners are attached after the next render to ensure DOM is ready.
   * @param config Configuration for the activity producer
   */
  public start(config?: Partial<ActivityProducerConfig>): void {
    if (this.started) {
      return;
    }
    this.started = true;
    const configObject: ActivityProducerConfig = { ...DEFAULT_ACTIVITY_PRODUCER_CONFIG, ...config };

    // Always use afterNextRender to ensure DOM is ready in all contexts
    afterNextRender(() => {
      ACTIVITY_EVENTS.forEach((eventType) => {
        const isHighFrequency = HIGH_FREQUENCY_EVENTS.includes(eventType);
        const listener = (event: Event) => {
          // do nothing if the event is a key kept pressed
          if (eventType === 'keydown' && event instanceof KeyboardEvent && event.repeat) {
            return;
          }
          // For high-frequency events, apply throttle BEFORE shouldBroadcast
          // to avoid expensive filter operations on every event (e.g. reflows)
          if (isHighFrequency && !this.shouldProcessHighFrequencyEvent(eventType, configObject.highFrequencyThrottleMs!)) {
            return;
          }
          // Apply filter if provided
          if (configObject.shouldBroadcast?.(event) === false) {
            return;
          }
          this.onActivity(eventType, configObject);
        };
        this.boundListeners.set(eventType, listener);
        document.addEventListener(eventType, listener, { passive: true, capture: true });
      });

      // Also listen for visibility changes
      const visibilityListener = () => {
        if (document.visibilityState === 'visible') {
          this.onActivity(VISIBILITY_CHANGE_EVENT, configObject);
        }
      };
      this.boundListeners.set(VISIBILITY_CHANGE_EVENT, visibilityListener);
      document.addEventListener(VISIBILITY_CHANGE_EVENT, visibilityListener, { passive: true, capture: true });

      // Set up nested iframe tracking if enabled
      if (configObject.trackNestedIframes) {
        this.iframeActivityTracker.start({
          pollIntervalMs: configObject.nestedIframePollIntervalMs,
          activityIntervalMs: configObject.nestedIframeActivityEmitIntervalMs,
          onActivity: () => this.onActivity(IFRAME_INTERACTION_EVENT, configObject)
        });
      }
    });
  }

  /**
   * Stops observing user activity events.
   */
  public stop(): void {
    this.boundListeners.forEach((listener, eventType) => {
      document.removeEventListener(eventType, listener, { capture: true });
    });
    this.boundListeners.clear();
    this.lastEmitTimestamps.clear();
    this.iframeActivityTracker.stop();
  }
}
