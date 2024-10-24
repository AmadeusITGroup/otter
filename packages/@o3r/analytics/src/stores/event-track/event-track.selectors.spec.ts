import {
  eventTrackInitialState
} from './event-track.reducer';
import * as selectors from './event-track.selectors';
import {
  EventTrackState
} from './event-track.state';

describe('EventTrack Selectors tests', () => {
  it('should return initial state', () => {
    expect(selectors.selectEventTrackState.projector(eventTrackInitialState).isTTIComputed).toBeFalsy();
    expect(selectors.selectEventTrackState.projector(eventTrackInitialState).heroComponent.children).toBeUndefined();
    expect(selectors.selectEventTrackState.projector(eventTrackInitialState).heroComponent.TTI).toEqual(0);
  });

  it('should return the initial hero component status', () => {
    const state: EventTrackState = { heroComponent: { id: 'Page', TTI: 0 }, isTTIComputed: false };

    expect(selectors.selectHeroComponentStatus.projector(state)).toBeUndefined();
  });

  it('should return the computed hero component status', () => {
    const state: EventTrackState = { heroComponent: { id: 'Page', TTI: 30 }, isTTIComputed: true };

    expect(selectors.selectHeroComponentStatus.projector(state)).toEqual(30);
  });
});
