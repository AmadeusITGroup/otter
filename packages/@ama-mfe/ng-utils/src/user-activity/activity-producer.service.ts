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

  /**
   * Current configuration
   */
  private config?: ActivityProducerConfig;

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
  }

  /**
   * Handles high-frequency activity with throttling.
   * Emits at most once per throttle interval during continuous activity.
   * @param eventType The type of activity event that occurred
   */
  private onActivityThrottled(eventType: UserActivityEventType): void {
    const now = Date.now();
    const lastEmit = this.lastEmitTimestamps.get(eventType) ?? 0;
    const throttleMs = this.config!.highFrequencyThrottleMs!;

    if (now - lastEmit >= throttleMs) {
      this.lastEmitTimestamps.set(eventType, now);
      this.onActivity(eventType);
    }
  }

  /**
   * Handles activity by sending a throttled message and emitting to local signal.
   * @param eventType The type of activity event that occurred
   */
  private onActivity(eventType: UserActivityEventType): void {
    const now = Date.now();

    // Always emit local activity signal (not throttled for local detection)
    this.localActivityWritable.set({
      channelId: 'local',
      eventType,
      timestamp: now
    });

    // Send message with throttling
    if (now - this.lastSentTimestamp >= this.config!.throttleMs) {
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
    // eslint-disable-next-line no-console -- error handling placeholder
    console.warn('Error in user activity service message', message);
  }

  /**
   * Starts observing user activity events.
   * When activity is detected, it sends a throttled message.
   * Event listeners are attached after the next render to ensure DOM is ready.
   * @param config Configuration for the activity producer
   */
  public start(config: ActivityProducerConfig): void {
    if (this.started) {
      return;
    }
    this.started = true;
    this.config = { ...DEFAULT_ACTIVITY_PRODUCER_CONFIG, ...config };

    // Always use afterNextRender to ensure DOM is ready in all contexts
    afterNextRender(() => {
      ACTIVITY_EVENTS.forEach((eventType) => {
        const isHighFrequency = HIGH_FREQUENCY_EVENTS.includes(eventType);
        const listener = (event: Event) => {
          // Apply filter if provided
          if (this.config!.shouldBroadcast && !this.config!.shouldBroadcast(event)) {
            return;
          }
          if (isHighFrequency) {
            this.onActivityThrottled(eventType);
          } else {
            this.onActivity(eventType);
          }
        };
        this.boundListeners.set(eventType, listener);
        document.addEventListener(eventType, listener, { passive: true, capture: true });
      });

      // Also listen for visibility changes
      const visibilityListener = () => {
        if (document.visibilityState === 'visible') {
          this.onActivity(VISIBILITY_CHANGE_EVENT);
        }
      };
      this.boundListeners.set(VISIBILITY_CHANGE_EVENT, visibilityListener);
      document.addEventListener('visibilitychange', visibilityListener);

      // Set up nested iframe tracking if enabled
      if (this.config!.trackNestedIframes) {
        this.iframeActivityTracker.start({
          pollIntervalMs: this.config!.nestedIframePollIntervalMs,
          activityIntervalMs: this.config!.nestedIframeActivityEmitIntervalMs,
          onActivity: () => this.onActivity(IFRAME_INTERACTION_EVENT)
        });
      }

      this.destroyRef.onDestroy(() => this.stop());
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
