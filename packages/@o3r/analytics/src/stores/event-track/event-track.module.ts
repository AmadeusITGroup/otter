import {
  InjectionToken,
  ModuleWithProviders,
  NgModule,
} from '@angular/core';
import {
  Action,
  ActionReducer,
  StoreModule,
} from '@ngrx/store';
import {
  eventTrackReducer,
} from './event-track.reducer';
import {
  EVENT_TRACK_STORE_NAME,
  EventTrackState,
} from './event-track.state';

/** Token of the EventTrack reducer */
export const EVENT_TRACK_REDUCER_TOKEN = new InjectionToken<ActionReducer<EventTrackState, Action>>('Feature EventTrack Reducer');

/** Provide default reducer for EventTrack store */
export function getDefaultEventTrackReducer() {
  return eventTrackReducer;
}

@NgModule({
  imports: [
    StoreModule.forFeature(EVENT_TRACK_STORE_NAME, EVENT_TRACK_REDUCER_TOKEN)
  ],
  providers: [
    { provide: EVENT_TRACK_REDUCER_TOKEN, useFactory: getDefaultEventTrackReducer }
  ]
})
export class EventTrackStoreModule {
  public static forRoot<T extends EventTrackState>(reducerFactory: () => ActionReducer<T, Action>): ModuleWithProviders<EventTrackStoreModule> {
    return {
      ngModule: EventTrackStoreModule,
      providers: [
        { provide: EVENT_TRACK_REDUCER_TOKEN, useFactory: reducerFactory }
      ]
    };
  }
}
