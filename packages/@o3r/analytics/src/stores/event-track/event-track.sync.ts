import type {
  Serializer,
} from '@o3r/core';
import {
  eventTrackInitialState,
} from './event-track.reducer';
import {
  EventTrackState,
} from './event-track.state';

export const eventTrackStorageSync: Readonly<Serializer<EventTrackState>> = {
  deserialize: (rawObject: any) => {
    return rawObject ? rawObject as EventTrackState : eventTrackInitialState;
  }
} as const;
