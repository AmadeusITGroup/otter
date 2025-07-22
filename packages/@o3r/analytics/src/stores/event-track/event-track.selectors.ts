import {
  createFeatureSelector,
  createSelector,
} from '@ngrx/store';
import {
  EVENT_TRACK_STORE_NAME,
  EventTrackState,
} from './event-track.state';

/** Select EventTrack State */
export const selectEventTrackState = createFeatureSelector<EventTrackState>(EVENT_TRACK_STORE_NAME);

/** Select hero component status */
export const selectHeroComponentStatus = createSelector(selectEventTrackState, (state): number | undefined => (state.isTTIComputed ? state.heroComponent.TTI : undefined));
