import {
  InjectionToken
} from '@angular/core';

/** Controls the activation of mesurements and ui events tracking */
export interface TrackActive {
  /** Boolean to activate/deactivate the ui event tracking */
  uiTracking: boolean;
  /** Boolean to activate/deactivate performace measurements */
  perfTracking: boolean;
}

/** Track events service configuration object */
export interface EventTrackConfiguration {
  /** Defines how many values will be kept in performance metrics stream */
  perfBufferSize: number;
  /** Defines how many values will be kept in ui events stream */
  uiEventsBufferSize: number;
  /** If true, it will use the browser API to get the value of the FP for the first time; */
  useBrowserApiForFirstFP: boolean;
  /** Controls the activation of mesurements and ui events tracking */
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
