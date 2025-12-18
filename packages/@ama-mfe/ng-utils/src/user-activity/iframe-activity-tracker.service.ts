import {
  Injectable,
} from '@angular/core';
import type {
  IframeActivityTrackerConfig,
} from './interfaces';

/**
 * Service that tracks user activity within nested iframes.
 *
 * Polls document.activeElement frequently to detect when an iframe has focus.
 * When an iframe gains focus, emits immediately and then at the configured interval.
 * When focus leaves the iframe, it stops emitting.
 *
 * This is needed because cross-origin iframes don't fire focus/blur events
 * that bubble to the parent, and the regular activity tracker can't detect
 * user interactions inside iframes.
 */
@Injectable({
  providedIn: 'root'
})
export class IframeActivityTrackerService {
  /**
   * Interval ID for polling activeElement
   */
  private pollIntervalId?: ReturnType<typeof setInterval>;

  /**
   * Interval ID for emitting activity at configured interval
   */
  private activityIntervalId?: ReturnType<typeof setInterval>;

  /**
   * Current configuration
   */
  private config?: IframeActivityTrackerConfig;

  /**
   * Whether the service has been started
   */
  private started = false;

  /**
   * Whether we are currently tracking iframe activity (iframe had focus on last poll)
   */
  private isTrackingIframeActivity = false;

  /**
   * Polls document.activeElement to detect iframe focus changes.
   * When iframe gains focus: emit immediately and start activity interval.
   * When iframe loses focus: stop activity interval.
   */
  private checkActiveElement(): void {
    const activeElement = document.activeElement;
    const iframeFocused = activeElement instanceof HTMLIFrameElement;

    if (iframeFocused && !this.isTrackingIframeActivity) {
      // Iframe just gained focus - emit immediately and start activity interval
      this.isTrackingIframeActivity = true;
      this.config?.onActivity();
      this.startActivityInterval();
    } else if (!iframeFocused && this.isTrackingIframeActivity) {
      // Focus left the iframe - stop activity interval
      this.isTrackingIframeActivity = false;
      this.stopActivityInterval();
    }
  }

  /**
   * Starts the activity emission interval.
   */
  private startActivityInterval(): void {
    this.stopActivityInterval();
    this.activityIntervalId = setInterval(() => {
      this.config?.onActivity();
    }, this.config!.activityIntervalMs);
  }

  /**
   * Stops the activity emission interval.
   */
  private stopActivityInterval(): void {
    if (this.activityIntervalId) {
      clearInterval(this.activityIntervalId);
      this.activityIntervalId = undefined;
    }
  }

  /**
   * Starts tracking nested iframes within the document.
   * @param config Configuration for the tracker
   */
  public start(config: IframeActivityTrackerConfig): void {
    if (this.started) {
      return;
    }
    this.started = true;
    this.config = config;

    // Poll frequently to detect focus changes quickly
    this.pollIntervalId = setInterval(
      () => this.checkActiveElement(),
      this.config.pollIntervalMs
    );
  }

  /**
   * Stops tracking nested iframes and cleans up resources.
   */
  public stop(): void {
    if (!this.started) {
      return;
    }
    this.started = false;

    if (this.pollIntervalId) {
      clearInterval(this.pollIntervalId);
      this.pollIntervalId = undefined;
    }

    this.stopActivityInterval();
    this.isTrackingIframeActivity = false;
    this.config = undefined;
  }
}
