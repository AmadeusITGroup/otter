import {
  USER_ACTIVITY_MESSAGE_TYPE,
  type UserActivityEventType,
  type UserActivityMessage,
  type UserActivityMessageV1_0,
} from '@ama-mfe/messages';
import {
  DOCUMENT,
} from '@angular/common';
import {
  afterNextRender,
  type AfterRenderRef,
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

const SCROLL_INPUT_WINDOW_MS = 1000;
const SCROLLBAR_RELEASE_EVENTS = ['pointerup', 'pointercancel'] as const;

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
  private readonly document = inject(DOCUMENT);
  private renderRef?: AfterRenderRef;
  private config?: ActivityProducerConfig;
  private lastLocalInteractionAt = 0;
  private scrollbarTarget?: EventTarget;

  /**
   * Timestamp of the last sent activity message
   */
  private lastSentTimestamp = 0;

  /**
   * Bound event listeners for cleanup
   */
  private readonly boundListeners = new Map<keyof DocumentEventMap, EventListener>();

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

  private readonly releaseScrollbar = () => {
    this.scrollbarTarget = undefined;
  };

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

  private getScrollbarTarget(event: Event): EventTarget | undefined {
    if (!(event instanceof MouseEvent)) {
      return undefined;
    }
    const target = event.target === this.document ? this.document.scrollingElement : event.target;
    if (!(target instanceof HTMLElement)) {
      return undefined;
    }
    const root = target === this.document.scrollingElement;
    const bounds = target.getBoundingClientRect();
    const width = root ? this.document.defaultView?.innerWidth ?? 0 : target.offsetWidth;
    const height = root ? this.document.defaultView?.innerHeight ?? 0 : target.offsetHeight;
    if (width <= 0 || height <= 0 || (!root && (bounds.width <= 0 || bounds.height <= 0))) {
      return undefined;
    }
    // Pointer coordinates include CSS scaling; scrollbar metrics use layout pixels.
    const x = root ? event.clientX : (event.clientX - bounds.left) * width / bounds.width;
    const y = root ? event.clientY : (event.clientY - bounds.top) * height / bounds.height;
    if (x < 0 || y < 0 || x >= width || y >= height) {
      return undefined;
    }
    const vertical = target.scrollHeight > target.clientHeight && (x < target.clientLeft || x >= target.clientLeft + target.clientWidth);
    const horizontal = target.scrollWidth > target.clientWidth && (y < target.clientTop || y >= target.clientTop + target.clientHeight);
    return vertical || horizontal ? (root ? this.document : target) : undefined;
  }

  private isActivityEvent(event: Event): boolean {
    if (event.type === 'focus') {
      return true;
    }
    if (!event.isTrusted) {
      return false;
    }
    if (event.type === 'scroll') {
      return event.target === this.scrollbarTarget
        || (this.lastLocalInteractionAt > 0 && Date.now() - this.lastLocalInteractionAt < SCROLL_INPUT_WINDOW_MS);
    }
    return true;
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
   * Immediately records and broadcasts SDK-classified input inside a nested iframe.
   * Call only for actual interaction, never focus, renders alone or periodic updates.
   * Tracking must be started first. Explicit reports are not throttled and do not affect DOM throttling.
   */
  public reportIframeInteraction(): void {
    if (!this.started) {
      return;
    }
    const timestamp = Date.now();
    this.localActivityWritable.set({ channelId: 'local', eventType: IFRAME_INTERACTION_EVENT, timestamp });
    this.sendActivityMessage(IFRAME_INTERACTION_EVENT, timestamp);
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
    this.config = configObject;

    // Always use afterNextRender to ensure DOM is ready in all contexts
    this.renderRef = afterNextRender(() => {
      if (!this.started || this.config !== configObject) {
        return;
      }
      const activityEvents: [keyof DocumentEventMap, UserActivityEventType][] = ACTIVITY_EVENTS
        .map((eventType) => [eventType, eventType]);
      // Reuse existing protocol categories for additional trusted DOM input.
      activityEvents.push(['wheel', 'scroll'], ['pointerdown', 'click'], ['touchmove', 'touchstart']);
      for (const eventType of SCROLLBAR_RELEASE_EVENTS) {
        this.boundListeners.set(eventType, this.releaseScrollbar);
        this.document.addEventListener(eventType, this.releaseScrollbar, { passive: true, capture: true });
      }
      this.document.defaultView?.addEventListener('blur', this.releaseScrollbar);
      activityEvents.forEach(([domEventType, eventType]) => {
        const isHighFrequency = HIGH_FREQUENCY_EVENTS.includes(eventType);
        const listener = (event: Event) => {
          // do nothing if the event is a key kept pressed
          if (eventType === 'keydown' && event instanceof KeyboardEvent && event.repeat) {
            return;
          }
          if (isHighFrequency && !this.shouldProcessHighFrequencyEvent(eventType, configObject.highFrequencyThrottleMs!)) {
            return;
          }
          // Apply filter if provided
          if (configObject.shouldBroadcast?.(event) === false) {
            return;
          }
          if (!this.isActivityEvent(event)) {
            return;
          }
          if (event.type === 'pointerdown') {
            this.scrollbarTarget = this.getScrollbarTarget(event);
          }
          if (event.type !== 'focus' && event.type !== 'scroll') {
            this.lastLocalInteractionAt = Date.now();
          }
          this.onActivity(eventType, configObject);
        };
        this.boundListeners.set(domEventType, listener);
        this.document.addEventListener(domEventType, listener, { passive: true, capture: true });
      });

      // Also listen for visibility changes
      const visibilityListener = () => {
        this.releaseScrollbar();
        if (this.document.visibilityState === 'visible') {
          this.onActivity(VISIBILITY_CHANGE_EVENT, configObject);
        }
      };
      this.boundListeners.set(VISIBILITY_CHANGE_EVENT, visibilityListener);
      this.document.addEventListener(VISIBILITY_CHANGE_EVENT, visibilityListener, { passive: true, capture: true });

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
    this.started = false;
    this.config = undefined;
    this.renderRef?.destroy();
    this.renderRef = undefined;
    this.boundListeners.forEach((listener, eventType) => {
      this.document.removeEventListener(eventType, listener, { capture: true });
    });
    this.boundListeners.clear();
    this.lastEmitTimestamps.clear();
    this.document.defaultView?.removeEventListener('blur', this.releaseScrollbar);
    this.lastLocalInteractionAt = 0;
    this.lastSentTimestamp = 0;
    this.releaseScrollbar();
    this.iframeActivityTracker.stop();
  }
}
