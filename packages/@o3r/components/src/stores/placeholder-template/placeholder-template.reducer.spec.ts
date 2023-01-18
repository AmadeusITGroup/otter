import * as actions from './placeholder-template.actions';
import {placeholderTemplateInitialState, placeholderTemplateReducer} from './placeholder-template.reducer';
import {PlaceholderTemplateState} from './placeholder-template.state';

describe('PlaceholderTemplate Store reducer', () => {

  let entitiesState: PlaceholderTemplateState;
  const firstPlaceholderTemplate: any = {id: 'placeholder1', genericItems: [], vars: {}, requestIds: []};
  const secondPlaceholderTemplate: any = {id: 'placeholder2', genericItems: [], vars: {}, requestIds: []};

  it('should have the correct initial state', () => {
    expect(placeholderTemplateInitialState.ids.length).toBe(0);
  });

  it('should by default return the initial state', () => {
    const state = placeholderTemplateReducer(placeholderTemplateInitialState, {type: 'fake'} as any);

    expect(state).toEqual(placeholderTemplateInitialState);
  });

  describe('Actions on state details', () => {
    beforeEach(() => {
      entitiesState = placeholderTemplateReducer(placeholderTemplateInitialState, actions.setPlaceholderTemplateEntityFromUrl({
        call: Promise.resolve({'template': '<div></div>'}),
        id: 'placeholder1',
        url: 'myPlaceholderUrl',
        resolvedUrl: 'myPlaceholderResolvedUrl'
      }));
      entitiesState = placeholderTemplateReducer(entitiesState, actions.setPlaceholderTemplateEntity({entity: firstPlaceholderTemplate}));
    });

    it('FAIL action should update the isPending to false and the isFailure to true', () => {
      const state = placeholderTemplateReducer({...placeholderTemplateInitialState, isPending: true}, actions.failPlaceholderTemplateEntity({}));

      expect(state.ids.length).toBe(0);
      expect(state.isPending).toBe(false);
      expect(state.isFailure).toBe(true);
    });
  });

  describe('Entity actions', () => {
    it('SET_ENTITY action should not clear current entities', () => {
      const initialState = placeholderTemplateReducer(placeholderTemplateInitialState, actions.setPlaceholderTemplateEntityFromUrl({
        call: Promise.resolve({'template': '<div></div>'}),
        id: 'placeholder1',
        url: 'myPlaceholderUrl',
        resolvedUrl: 'myPlaceholderResolvedUrl'
      }));
      const firstState = placeholderTemplateReducer(initialState, actions.setPlaceholderTemplateEntity({entity: firstPlaceholderTemplate}));
      const intermediaryState = placeholderTemplateReducer(firstState, actions.setPlaceholderTemplateEntityFromUrl({
        call: Promise.resolve({'template': '<div></div>'}),
        id: 'placeholder2',
        url: 'myPlaceholderUrl',
        resolvedUrl: 'myPlaceholderResolvedUrl'
      }));
      const secondState = placeholderTemplateReducer(intermediaryState, actions.setPlaceholderTemplateEntity({entity: secondPlaceholderTemplate}));

      expect(secondState.ids.length).toEqual(2);
      expect((secondState.ids as string[]).find((id) => (id === firstPlaceholderTemplate.id))).toBeDefined();
      expect((secondState.ids as string[]).find((id) => (id === secondPlaceholderTemplate.id))).toBeDefined();
    });

    it('FAIL_ENTITY action should update the isPending to false and the isFailure to true', () => {
      const state = placeholderTemplateReducer({...placeholderTemplateInitialState, isPending: true}, actions.failPlaceholderTemplateEntity({}));

      expect(state.ids.length).toBe(0);
      expect(state.isPending).toBe(false);
      expect(state.isFailure).toBe(true);
    });

    it('FAIL_ENTITIES action should update the global isPending to false in case there are some newIds in the payload', () => {
      const initialState = placeholderTemplateReducer(placeholderTemplateInitialState, actions.setPlaceholderTemplateEntityFromUrl({
        call: Promise.resolve({'template': '<div></div>'}),
        id: 'placeholder1',
        url: 'myPlaceholderUrl',
        resolvedUrl: 'myPlaceholderResolvedUrl',
        requestId: 'id1'
      }));

      expect(initialState.isPending).toBe(undefined);
      expect(initialState.isFailure).toBe(undefined);
      const firstState = placeholderTemplateReducer(initialState, actions.failPlaceholderTemplateEntity({error: 'dummy error', ids: ['placeholder1'], requestId: 'id1'}));

      expect(firstState.isPending).toBe(false);
      expect(firstState.isFailure).toBe(undefined);
      expect(firstState.entities.placeholder1.isPending).toBe(false);
      expect(firstState.entities.placeholder1.isFailure).toBe(true);
    });
  });

  describe('API call actions', () => {
    it('SET_ENTITY_FROM_URL action should clear current entities and set new ones', () => {
      const firstState = placeholderTemplateReducer(placeholderTemplateInitialState, actions.setPlaceholderTemplateEntityFromUrl({
        call: Promise.resolve({'template': '<div></div>'}),
        id: 'placeholder1',
        url: 'myPlaceholderUrl',
        resolvedUrl: 'myPlaceholderResolvedUrl',
        requestId: 'id1'
      }));

      expect(firstState.entities.placeholder1.isPending).toBe(true);
      expect(firstState.entities.placeholder1.isFailure).toBe(false);
    });

  });
});
