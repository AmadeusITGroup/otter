import type { Serializer } from '@o3r/core';
import { eventTrackInitialState } from './event-track.reducer';
import { EventTrackState } from './event-track.state';

export const eventTrackStorageSync: Serializer<EventTrackState> = {
  deserialize: (rawObject: any) => {
    if (rawObject) {
      return rawObject as EventTrackState;
    } else {
      return eventTrackInitialState;
    }
  }
};
