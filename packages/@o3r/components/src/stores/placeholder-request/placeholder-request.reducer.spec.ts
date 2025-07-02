import * as actions from './placeholder-request.actions';
import {
  placeholderRequestInitialState,
  placeholderRequestReducer,
} from './placeholder-request.reducer';

describe('PlaceholderRequest Store reducer', () => {
  it('should have the correct initial state', () => {
    expect(placeholderRequestInitialState.ids.length).toBe(0);
  });

  it('should by default return the initial state', () => {
    const state = placeholderRequestReducer(placeholderRequestInitialState, { type: 'fake' } as any);
    expect(state).toEqual(placeholderRequestInitialState);
  });

  it('Cancel request should work properly', () => {
    const initialState = placeholderRequestReducer(placeholderRequestInitialState, actions.setPlaceholderRequestEntityFromUrl({
      call: Promise.resolve({ template: '<div>Template3</div>' }),
      id: 'www.url3.com/[LANG]',
      resolvedUrl: 'www.url3.com/en',
      requestId: 'id1'
    }));
    expect(initialState.entities['www.url3.com/[LANG]'].isPending).toBe(true);
    expect(initialState.entities['www.url3.com/[LANG]'].requestIds).toStrictEqual(['id1']);
    const firstState = placeholderRequestReducer(initialState, actions.cancelPlaceholderRequest({
      requestId: 'id1',
      id: 'www.url3.com/[LANG]'
    }));
    expect(firstState.entities['www.url3.com/[LANG]'].isPending).toBe(false);
    expect(firstState.entities['www.url3.com/[LANG]'].requestIds).toStrictEqual([]);
  });

  describe('Entity actions', () => {
    it('ACTION_UPDATE_ENTITY_SYNC action should not touch existing properties not provided in the payload', () => {
      const initialState = placeholderRequestReducer(placeholderRequestInitialState, actions.setPlaceholderRequestEntityFromUrl({
        call: Promise.resolve({ template: '<div>Template3</div>' }),
        id: 'www.url3.com/[LANG]',
        resolvedUrl: 'www.url3.com/en',
        requestId: 'id1'
      }));
      expect(initialState.entities['www.url3.com/[LANG]'].used).toBe(true);
      expect(initialState.entities['www.url3.com/[LANG]'].isPending).toBe(true);
      const firstState = placeholderRequestReducer(initialState, actions.updatePlaceholderRequestEntitySync({
        entity: {
          id: 'www.url3.com/[LANG]',
          used: false
        }
      }));
      expect(firstState.entities['www.url3.com/[LANG]'].used).toBe(false);
      expect(firstState.entities['www.url3.com/[LANG]'].resolvedUrl).toBe('www.url3.com/en');
      expect(firstState.entities['www.url3.com/[LANG]'].isPending).toBe(true);
    });

    it('ACTION_UPDATE_ENTITY action should not touch existing properties not provided in the payload and update the pending status', () => {
      const initialState = placeholderRequestReducer(placeholderRequestInitialState, actions.setPlaceholderRequestEntityFromUrl({
        call: Promise.resolve({ template: '<div>Template3</div>' }),
        id: 'www.url3.com/[LANG]',
        resolvedUrl: 'www.url3.com/en',
        requestId: 'id1'
      }));
      expect(initialState.entities['www.url3.com/[LANG]'].isPending).toBe(true);
      const firstState = placeholderRequestReducer(initialState, actions.updatePlaceholderRequestEntity({
        entity: {
          id: 'www.url3.com/[LANG]',
          resolvedUrl: 'www.url3.com/en'
        },
        requestId: 'id1'
      }));
      expect(firstState.entities['www.url3.com/[LANG]'].used).toBe(true);
      expect(firstState.entities['www.url3.com/[LANG]'].resolvedUrl).toBe('www.url3.com/en');
      expect(firstState.entities['www.url3.com/[LANG]'].isPending).toBe(false);
    });

    it('FAIL_ENTITIES action should update the global isPending to false in case there are some newIds in the payload', () => {
      const initialState = placeholderRequestReducer(placeholderRequestInitialState, actions.setPlaceholderRequestEntityFromUrl({
        call: Promise.resolve({ template: '<div>Template3</div>' }),
        id: 'www.url3.com/[LANG]',
        resolvedUrl: 'www.url3.com/en',
        requestId: 'id1'
      }));

      expect(initialState.isPending).toBe(true);
      expect(initialState.isFailure).toBe(false);
      const firstState = placeholderRequestReducer(initialState, actions.failPlaceholderRequestEntity({
        error: 'dummy error',
        ids: ['www.url3.com/[LANG]'],
        requestId: 'id1'
      }));

      expect(firstState.isPending).toBe(false);
      expect(firstState.isFailure).toBe(false);
      expect(firstState.entities['www.url3.com/[LANG]'].isPending).toBe(false);
      expect(firstState.entities['www.url3.com/[LANG]'].isFailure).toBe(true);
    });
  });

  describe('API call actions', () => {
    it('SET_ENTITY_FROM_URL action should clear current entities and set new ones', () => {
      const firstState = placeholderRequestReducer(placeholderRequestInitialState, actions.setPlaceholderRequestEntityFromUrl({
        call: Promise.resolve({ template: '<div>Template3</div>' }),
        id: 'www.url3.com/[LANG]',
        resolvedUrl: 'www.url3.com/en',
        requestId: 'id1'
      }));

      expect(firstState.entities['www.url3.com/[LANG]'].isPending).toBe(true);
      expect(firstState.entities['www.url3.com/[LANG]'].isFailure).toBe(false);
      expect(firstState.entities['www.url3.com/[LANG]'].used).toBe(true);
    });
  });
});
