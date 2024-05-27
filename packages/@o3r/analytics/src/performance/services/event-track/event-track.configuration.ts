import {
  InjectionToken,
} from '@angular/core';

/** Controls the activation of measurements and ui events tracking */
export interface TrackActive {
  /**
   * Boolean to activate/deactivate the ui event tracking
   * @deprecated use {@link AnalyticsEventReporter.isTrackingActive} instead, will be removed in v12. Need to be turned to `false` when using {@link AnalyticsEventReporter}.
   */
  uiTracking: boolean;
  /** Boolean to activate/deactivate performance measurements */
  perfTracking: boolean;
}

/** Track events service configuration object */
export interface EventTrackConfiguration {
  /** Defines how many values will be kept in performance metrics stream */
  perfBufferSize: number;
  /**
   * Defines how many values will be kept in ui events stream
   * @deprecated use {@link AnalyticsEventReporter} instead, will be removed in v12
   */
  uiEventsBufferSize: number;
  /** If true, it will use the browser API to get the value of the FP for the first time; */
  useBrowserApiForFirstFP: boolean;
  /** Controls the activation of measurements and ui events tracking */
  activate: TrackActive;
}

/** Default configuration of tracking service */
export const defaultEventTrackConfiguration = {
  perfBufferSize: 10,
  uiEventsBufferSize: 20,
  useBrowserApiForFirstFP: false,
  activate: {
    uiTracking: true,
    perfTracking: true
  }
};

/** Tracking service configuration token used to override the default configuration */
export const EVENT_TRACK_SERVICE_CONFIGURATION = new InjectionToken<Partial<EventTrackConfiguration>>('EVENT TRACK');
