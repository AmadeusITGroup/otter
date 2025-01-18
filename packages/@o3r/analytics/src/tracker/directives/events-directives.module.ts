import {
  AnalyticTrackClick,
} from './click-event.directive';
import {
  AnalyticTrackEvent,
} from './events.directive';
import {
  AnalyticTrackFocus,
} from './focus-event.directive';

/** List of available Analytics directives */
export const ANALYTICS_TRACK_DIRECTIVES = [
  AnalyticTrackClick,
  AnalyticTrackEvent,
  AnalyticTrackFocus
];
