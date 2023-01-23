export const asyncEntityReducerSpecContent = `import * as actions from './example.actions';
import {exampleInitialState, exampleReducer} from './example.reducer';
import {ExampleState} from './example.state';

describe('Example Store reducer', () => {

  let entitiesState: ExampleState;
  const firstExample: any = {id: 'example1', genericItems: []};
  const secondExample: any = {id: 'example2', genericItems: []};
  const exampleReply: any = [firstExample];

  it('should have the correct initial state', () => {
    expect(exampleInitialState.ids.length).toBe(0);
  });


  it('should by default return the initial state', () => {
    const state = exampleReducer(exampleInitialState, {type: 'fake'} as any);
    expect(state).toEqual(exampleInitialState);
  });

  describe('Actions on state details ', () => {
    beforeEach(() => {
      entitiesState = exampleReducer(exampleInitialState, actions.setExampleEntities({entities: [firstExample, secondExample]}));
    });

    it('SET action should clear current state details and return a state with the new one', () => {
      const firstState = exampleReducer(entitiesState, actions.setExample({stateDetails: {requestIds: []}}));
      const secondState = exampleReducer(firstState, actions.setExample({stateDetails: {requestIds: [], isPending: false}}));
      expect(secondState.isPending).toEqual(false);
    });

    it('UPDATE should update the state details without modifying entities', () => {
      const firstState = exampleReducer(entitiesState, actions.setExample({stateDetails: {requestIds: []}}));
      const secondState = exampleReducer(firstState, actions.updateExample({stateDetails: {isPending: false}}));
      expect(secondState.isPending).toEqual(false);
    });

    it('RESET action should return initial state', () => {
      const state = exampleReducer(entitiesState, actions.resetExample());
      expect(state).toEqual(exampleInitialState);
    });

    it('FAIL action should update the isPending to false and the isFailure to true', () => {
      const state = exampleReducer({...exampleInitialState, isPending: true}, actions.failExampleEntities({}));
      expect(state.ids.length).toBe(0);
      expect(state.isPending).toBe(false);
      expect(state.isFailure).toBe(true);
    });
  });

  describe('Entity actions', () => {
    it('SET_ENTITIES action should clear current entities and set new ones', () => {
      const firstState = exampleReducer(exampleInitialState, actions.setExampleEntities({entities: [firstExample]}));
      const secondState = exampleReducer(firstState, actions.setExampleEntities({entities: [secondExample]}));
      expect(secondState.ids.length).toEqual(1);
      expect((secondState.ids as string[]).find((id) => (id === firstExample.id))).toBeUndefined();
      expect((secondState.ids as string[]).find((id) => (id === secondExample.id))).toBeDefined();
    });

    it('UPDATE_ENTITTIES action should only update existing entities', () => {
      const firstExampleUpdated = {...firstExample, genericField: 'genericId'};
      const firstState = exampleReducer(exampleInitialState, actions.setExampleEntities({entities: [firstExample]}));
      const secondState = exampleReducer(firstState,
        actions.updateExampleEntities({entities: [firstExampleUpdated, secondExample]}));
      expect(secondState.ids.length).toEqual(1);
      expect((secondState.ids as string[]).find((id) => (id === firstExample.id))).toBeDefined();
      expect((secondState.ids as string[]).find((id) => (id === secondExample.id))).toBeUndefined();
    });

    it('UPSERT_ENTITIES action should update existing entities and add the new ones', () => {
      const firstExampleUpdated = {...firstExample, genericField: 'genericId'};
      const firstState = exampleReducer(exampleInitialState, actions.setExampleEntities({entities: [firstExample]}));
      const secondState = exampleReducer(firstState,
        actions.upsertExampleEntities({entities: [firstExampleUpdated, secondExample]}));
      expect(secondState.ids.length).toEqual(2);
      expect((secondState.ids as string[]).find((id) => (id === firstExample.id))).toBeDefined();
      expect((secondState.ids as string[]).find((id) => (id === secondExample.id))).toBeDefined();
    });

    it('CLEAR_ENTITIES action should clear only the entities', () => {
      const firstState = exampleReducer(exampleInitialState, actions.setExampleEntities({entities: [firstExample, secondExample]}));
      const secondState = exampleReducer(firstState, actions.setExample({stateDetails: {requestIds: [], isPending: false}}));
      const thirdState = exampleReducer(secondState, actions.clearExampleEntities());
      expect(thirdState.ids.length).toEqual(0);
    });

    it('FAIL_ENTITIES action should update the isPending to false and the isFailure to true', () => {
      const state = exampleReducer({...exampleInitialState, isPending: true}, actions.failExampleEntities({}));
      expect(state.ids.length).toBe(0);
      expect(state.isPending).toBe(false);
      expect(state.isFailure).toBe(true);
    });

    it('FAIL_ENTITIES action should update the global isPending to false in case there are some newIds in the payload', () => {
      const firstState = exampleReducer(exampleInitialState, actions.setExampleEntities({entities: [firstExample]}));
      const secondState = exampleReducer({...firstState, isPending : true},
        actions.failExampleEntities({error: 'dummy error', ids: [secondExample.id]}));
      expect(secondState.isPending).toBe(false);
      expect(secondState.isFailure).toBe(true);
    });
  });

  describe('API call actions', () => {
    it('SET_ENTITIES_FROM_API action should clear current entities and set new ones', () => {
      const firstState = exampleReducer(exampleInitialState, actions.setExampleEntitiesFromApi({call: Promise.resolve(exampleReply), requestId: 'test'}));
      expect(firstState.isPending).toEqual(true);
    });
    it('UPDATE_ENTITIES_FROM_API action should clear current entities and set new ones', () => {
      const firstState = exampleReducer(exampleInitialState, actions.setExampleEntities({entities: [firstExample]}));
      const secondState = exampleReducer(firstState,
        actions.updateExampleEntitiesFromApi({call: Promise.resolve(exampleReply), ids: [firstExample.id], requestId: 'test'}));
      expect(secondState.isPending).toBeFalsy();
      expect(secondState.entities[firstExample.id]!.isPending).toEqual(true);
    });
    it('UPSERT_ENTITIES_FROM_API action should clear current entities and set new ones', () => {
      const firstState = exampleReducer(exampleInitialState, actions.upsertExampleEntitiesFromApi({call: Promise.resolve(exampleReply), requestId: 'test'}));
      expect(firstState.isPending).toEqual(true);
    });
  });
});

`;
