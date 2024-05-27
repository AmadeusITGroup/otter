import * as actions from './event-track.actions';
import {
  eventTrackInitialState,
  eventTrackReducer,
} from './event-track.reducer';
import {
  EventTrackState,
  RegisterHeroComponentPayload,
} from './event-track.state';

describe('EventTrack Store reducer', () => {
  const simpleState: EventTrackState = { heroComponent: { id: 'Page', TTI: 0 }, isTTIComputed: false };
  const firstEventTrack: EventTrackState = { heroComponent: { id: 'Page', TTI: 150 }, isTTIComputed: true };
  const secondEventTrack: EventTrackState = { heroComponent: { id: 'Page', TTI: 30 }, isTTIComputed: true };

  it('should by default return the initial state', () => {
    const state = eventTrackReducer(eventTrackInitialState, { type: 'fake' } as any);

    expect(state).toEqual(eventTrackInitialState);
  });

  describe('Actions on state details', () => {
    it('SET action should clear current state details and return a state with the new one', () => {
      const firstState = eventTrackReducer(simpleState, actions.setEventTrack({ model: firstEventTrack }));

      expect(firstState).toEqual(firstEventTrack);
    });

    it('UPDATE should update the state details', () => {
      const firstState = eventTrackReducer(firstEventTrack, actions.updateEventTrack({ model: secondEventTrack }));

      expect(firstState).toEqual(secondEventTrack);
    });

    it('RESET action should return initial state', () => {
      const state = eventTrackReducer(simpleState, actions.resetEventTrack());

      expect(state).toEqual(eventTrackInitialState);
    });
  });

  describe('Actions on hero component and TTI', () => {
    it('REGISTER_HERO_COMPONENT action should register the hero component and its children as specified in the payload', () => {
      const payload: RegisterHeroComponentPayload = {
        id: 'Page1',
        children: [{ id: 'Child1', TTI: 0 }, { id: 'Child2', TTI: 0 }]
      };
      const firstState = eventTrackReducer(simpleState, actions.registerHeroComponent({ model: payload }));

      expect(firstState.heroComponent.children.length).toEqual(2);
      expect(firstState.isTTIComputed).toBeFalsy();
    });

    it('ACTION_SET_HERO_COMPONENT_TTI action should set the TTI of the specified component and recompute the parent TTI', () => {
      const payload: RegisterHeroComponentPayload = {
        id: 'Page1',
        children: [{ id: 'Child1', TTI: 0 }, { id: 'Child2', TTI: 0 }]
      };
      const firstState = eventTrackReducer(simpleState, actions.registerHeroComponent({ model: payload }));
      const secondState = eventTrackReducer(firstState, actions.setHeroComponentTTI({ model: { id: 'Child1', TTI: 70 } }));
      const thirdState = eventTrackReducer(secondState, actions.setHeroComponentTTI({ model: { id: 'Child2', TTI: 100 } }));

      expect(secondState.heroComponent.children.find((child) => child.id === 'Child1').TTI).toEqual(70);
      expect(secondState.heroComponent.TTI).toEqual(70);
      expect(secondState.isTTIComputed).toBeFalsy();

      expect(thirdState.heroComponent.children.find((child) => child.id === 'Child2').TTI).toEqual(100);
      expect(thirdState.heroComponent.TTI).toEqual(100);
      expect(thirdState.isTTIComputed).toBeTruthy();
    });

    it('ACTION_SET_HERO_COMPONENT_TTI action should wait for TTI of the parent to be computed before marking computation complete if measureSelf is true (parent TTI higher)', () => {
      const payload: RegisterHeroComponentPayload = {
        id: 'Page1',
        measureSelf: true,
        children: [{ id: 'Child1', TTI: 0 }, { id: 'Child2', TTI: 0 }]
      };
      const firstState: EventTrackState = eventTrackReducer(simpleState, actions.registerHeroComponent({ model: payload }));
      const secondState: EventTrackState = eventTrackReducer(firstState, actions.setHeroComponentTTI({ model: { id: 'Child1', TTI: 70 } }));
      const thirdState: EventTrackState = eventTrackReducer(secondState, actions.setHeroComponentTTI({ model: { id: 'Child2', TTI: 100 } }));
      const fourthState: EventTrackState = eventTrackReducer(thirdState, actions.setHeroComponentTTI({ model: { id: 'Page1', TTI: 120 } }));

      expect(secondState.heroComponent.children.find((child) => child.id === 'Child1').TTI).toEqual(70);
      expect(secondState.heroComponent.TTI).toEqual(70);
      expect(secondState.isTTIComputed).toBeFalsy();

      expect(thirdState.heroComponent.children.find((child) => child.id === 'Child2').TTI).toEqual(100);
      expect(thirdState.heroComponent.TTI).toEqual(100);
      expect(thirdState.isTTIComputed).toBeFalsy();

      expect(fourthState.heroComponent.TTI).toEqual(120);
      expect(fourthState.isTTIComputed).toBeTruthy();
    });

    it('ACTION_SET_HERO_COMPONENT_TTI action should wait for TTI of the parent to be computed before marking computation complete if measureSelf is true (parent TTI lower)', () => {
      const payload: RegisterHeroComponentPayload = {
        id: 'Page1',
        measureSelf: true,
        children: [{ id: 'Child1', TTI: 0 }, { id: 'Child2', TTI: 0 }]
      };
      const firstState: EventTrackState = eventTrackReducer(simpleState, actions.registerHeroComponent({ model: payload }));
      const secondState: EventTrackState = eventTrackReducer(firstState, actions.setHeroComponentTTI({ model: { id: 'Child1', TTI: 70 } }));
      const thirdState: EventTrackState = eventTrackReducer(secondState, actions.setHeroComponentTTI({ model: { id: 'Child2', TTI: 100 } }));
      const fourthState: EventTrackState = eventTrackReducer(thirdState, actions.setHeroComponentTTI({ model: { id: 'Page1', TTI: 90 } }));

      expect(secondState.heroComponent.children.find((child) => child.id === 'Child1').TTI).toEqual(70);
      expect(secondState.heroComponent.TTI).toEqual(70);
      expect(secondState.isTTIComputed).toBeFalsy();

      expect(thirdState.heroComponent.children.find((child) => child.id === 'Child2').TTI).toEqual(100);
      expect(thirdState.heroComponent.TTI).toEqual(100);
      expect(thirdState.isTTIComputed).toBeFalsy();

      expect(fourthState.heroComponent.TTI).toEqual(100);
      expect(fourthState.isTTIComputed).toBeTruthy();
    });

    it('ACTION_SET_HERO_COMPONENT_TTI action should wait for TTI of the parent to be computed before marking computation complete if measureSelf is true (nested)', () => {
      const payload: RegisterHeroComponentPayload = {
        id: 'Page1',
        measureSelf: true,
        children: [{ id: 'Child1', TTI: 0, measureSelf: true, children: [{ id: 'SubChild', TTI: 0 }] }, { id: 'Child2', TTI: 0 }]
      };
      const firstState: EventTrackState = eventTrackReducer(simpleState, actions.registerHeroComponent({ model: payload }));
      const secondState: EventTrackState = eventTrackReducer(firstState, actions.setHeroComponentTTI({ model: { id: 'Child1', TTI: 70, involvedApiEndpoints: [] } }));
      const thirdState: EventTrackState = eventTrackReducer(secondState, actions.setHeroComponentTTI({ model: { id: 'Child2', TTI: 100, involvedApiEndpoints: ['endpoint1'] } }));
      const fourthState: EventTrackState = eventTrackReducer(thirdState, actions.setHeroComponentTTI({ model: { id: 'Page1', TTI: 90, involvedApiEndpoints: ['endpoint2'] } }));
      const fifthState: EventTrackState = eventTrackReducer(fourthState, actions.setHeroComponentTTI({ model: { id: 'SubChild', TTI: 290, involvedApiEndpoints: ['endpoint3'] } }));

      expect(secondState.heroComponent.children.find((child) => child.id === 'Child1').TTI).toEqual(70);
      expect(secondState.heroComponent.TTI).toEqual(70);
      expect(secondState.isTTIComputed).toBeFalsy();

      expect(thirdState.heroComponent.children.find((child) => child.id === 'Child2').TTI).toEqual(100);
      expect(thirdState.heroComponent.TTI).toEqual(100);
      expect(thirdState.isTTIComputed).toBeFalsy();

      expect(fourthState.heroComponent.TTI).toEqual(100);
      expect(fourthState.isTTIComputed).toBeFalsy();
      expect(fifthState.heroComponent.children.find((child) => child.id === 'Child1').TTI).toEqual(290);
      expect(fifthState.heroComponent.children.find((child) => child.id === 'Child2').TTI).toEqual(100);
      expect(fifthState.heroComponent.TTI).toEqual(290);
      expect(fifthState.heroComponent.involvedApiEndpoints).toEqual(['endpoint3']);
      expect(fifthState.isTTIComputed).toBeTruthy();
    });

    it('ACTION_SET_HERO_COMPONENT_TTI action should get the involved API endpoints of the component with highest TTI (nested)', () => {
      const payload: RegisterHeroComponentPayload = {
        id: 'Page1',
        measureSelf: true,
        children: [{ id: 'Child1', TTI: 0, measureSelf: true, children: [{ id: 'SubChild', TTI: 0 }] }, { id: 'Child2', TTI: 0 }]
      };
      const firstState: EventTrackState = eventTrackReducer(simpleState, actions.registerHeroComponent({ model: payload }));
      const secondState: EventTrackState = eventTrackReducer(firstState, actions.setHeroComponentTTI({ model: { id: 'Child1', TTI: 70, involvedApiEndpoints: ['EP-child1'] } }));
      const thirdState: EventTrackState = eventTrackReducer(secondState, actions.setHeroComponentTTI({ model: { id: 'Child2', TTI: 100, involvedApiEndpoints: ['EP-child2'] } }));
      const fourthState: EventTrackState = eventTrackReducer(thirdState, actions.setHeroComponentTTI({ model: { id: 'Page1', TTI: 900, involvedApiEndpoints: ['EP-page1'] } }));
      const fifthState: EventTrackState = eventTrackReducer(fourthState, actions.setHeroComponentTTI({ model: { id: 'SubChild', TTI: 1000, involvedApiEndpoints: ['EP-subchild1'] } }));

      expect(secondState.heroComponent.TTI).toEqual(70);
      expect(secondState.isTTIComputed).toBeFalsy();

      expect(thirdState.heroComponent.TTI).toEqual(100);
      expect(thirdState.isTTIComputed).toBeFalsy();

      expect(fourthState.heroComponent.TTI).toEqual(900);
      expect(fourthState.isTTIComputed).toBeFalsy();

      expect(fifthState.heroComponent.TTI).toEqual(1000);
      expect(fifthState.heroComponent.involvedApiEndpoints).toEqual(['EP-subchild1']);
      expect(fifthState.isTTIComputed).toBeTruthy();
    });
  });

  it('ACTION_SET_HERO_COMPONENT_TTI action should get all the involved API endpoints if the parent component contains highest TTI (nested)', () => {
    const payload: RegisterHeroComponentPayload = {
      id: 'Page1',
      measureSelf: true,
      children: [{ id: 'Child1', TTI: 0, measureSelf: true, children: [{ id: 'SubChild', TTI: 0 }] }, { id: 'Child2', TTI: 0 }]
    };
    const firstState: EventTrackState = eventTrackReducer(simpleState, actions.registerHeroComponent({ model: payload }));
    const secondState: EventTrackState = eventTrackReducer(firstState, actions.setHeroComponentTTI({ model: { id: 'Child1', TTI: 70, involvedApiEndpoints: ['EP-child1'] } }));
    const thirdState: EventTrackState = eventTrackReducer(secondState, actions.setHeroComponentTTI({ model: { id: 'Child2', TTI: 100, involvedApiEndpoints: ['EP-child2'] } }));
    const fourthState: EventTrackState = eventTrackReducer(thirdState, actions.setHeroComponentTTI({ model: { id: 'Page1', TTI: 900, involvedApiEndpoints: ['EP-page1'] } }));
    const fifthState: EventTrackState = eventTrackReducer(fourthState, actions.setHeroComponentTTI({ model: { id: 'SubChild', TTI: 100, involvedApiEndpoints: ['EP-subchild1'] } }));

    expect(secondState.heroComponent.TTI).toEqual(70);
    expect(secondState.isTTIComputed).toBeFalsy();

    expect(thirdState.heroComponent.TTI).toEqual(100);
    expect(thirdState.isTTIComputed).toBeFalsy();

    expect(fourthState.heroComponent.TTI).toEqual(900);
    expect(fourthState.isTTIComputed).toBeFalsy();

    expect(fifthState.heroComponent.TTI).toEqual(900);
    expect(fifthState.heroComponent.involvedApiEndpoints?.length).toEqual(4);
    fifthState.heroComponent.involvedApiEndpoints?.map((endPoint) => ['EP-page1', 'EP-child1', 'EP-child2', 'EP-subchild1'].includes(endPoint));

    expect(fifthState.isTTIComputed).toBeTruthy();
  });

  it('ACTION_SET_HERO_COMPONENT_TTI action should get the involved API endpoints of all the child with max TTI)', () => {
    const payload1: RegisterHeroComponentPayload = {
      id: 'Page1',
      measureSelf: true,
      children: [{ id: 'Child1', measureSelf: true, TTI: 0, children: [{ id: 'SubChild', TTI: 0 }] }, { id: 'Child2', TTI: 0 }]
    };
    const firstState: EventTrackState = eventTrackReducer(simpleState, actions.registerHeroComponent({ model: payload1 }));
    const secondState: EventTrackState = eventTrackReducer(firstState, actions.setHeroComponentTTI({ model: { id: 'Child2', TTI: 900, involvedApiEndpoints: ['EP-child2'] } }));
    const thirdState: EventTrackState = eventTrackReducer(secondState, actions.setHeroComponentTTI({ model: { id: 'Child1', TTI: 700, involvedApiEndpoints: ['EP-child1'] } }));
    const fourthState: EventTrackState = eventTrackReducer(thirdState, actions.setHeroComponentTTI({ model: { id: 'SubChild', TTI: 900, involvedApiEndpoints: ['EP-subchild1', 'EP-child2'] } }));
    const fifthState: EventTrackState = eventTrackReducer(fourthState, actions.setHeroComponentTTI({ model: { id: 'Page1', TTI: 70, involvedApiEndpoints: ['EP-page1'] } }));

    expect(secondState.heroComponent.TTI).toEqual(900);
    expect(secondState.isTTIComputed).toBeFalsy();

    expect(fifthState.heroComponent.TTI).toEqual(900);
    expect(fifthState.heroComponent.involvedApiEndpoints?.length).toEqual(2);
    expect(fifthState.isTTIComputed).toBeTruthy();
  });

  it('ACTION_SET_HERO_COMPONENT_TTI action should get the involved API endpoints of the child with max TTI', () => {
    const payload1: RegisterHeroComponentPayload = {
      id: 'Page1',
      measureSelf: true,
      children: [{ id: 'Child1', TTI: 0 }, { id: 'Child2', TTI: 0 }]
    };
    const firstState: EventTrackState = eventTrackReducer(simpleState, actions.registerHeroComponent({ model: payload1 }));
    const secondState: EventTrackState = eventTrackReducer(firstState, actions.setHeroComponentTTI({ model: { id: 'Page1', TTI: 70, involvedApiEndpoints: ['EP-page1'] } }));
    const thirdState: EventTrackState = eventTrackReducer(secondState, actions.setHeroComponentTTI({ model: { id: 'Child2', TTI: 900, involvedApiEndpoints: ['EP-child2'] } }));
    const fourthState: EventTrackState = eventTrackReducer(thirdState, actions.setHeroComponentTTI({ model: { id: 'Child1', TTI: 700, involvedApiEndpoints: ['EP-child1'] } }));

    expect(secondState.heroComponent.TTI).toEqual(70);
    expect(secondState.isTTIComputed).toBeFalsy();

    expect(thirdState.heroComponent.TTI).toEqual(900);
    expect(thirdState.isTTIComputed).toBeFalsy();

    expect(fourthState.heroComponent.TTI).toEqual(900);
    expect(fourthState.heroComponent.involvedApiEndpoints?.length).toEqual(1);
    expect(fourthState.heroComponent.involvedApiEndpoints).toEqual(['EP-child2']);
    expect(fourthState.isTTIComputed).toBeTruthy();
  });
});
