export const syncEntityReducerSpecContent = `import * as actions from './example.actions';
import {exampleInitialState, exampleReducer} from './example.reducer';
import {ExampleState} from './example.state';

describe('Example Store reducer', () => {

  let entitiesState: ExampleState;
  const firstExample: any = {id: 'example1', genericItems: []};
  const secondExample: any = {id: 'example2', genericItems: []};

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

    it('SET action should clear current cart state details and return a state with the new one', () => {
      const firstState = exampleReducer(entitiesState, actions.setExample({stateDetails: {}}));
      expect(Object.keys(firstState).length).toEqual(2);
    });

    it('UPDATE should update the state details without modifying entities', () => {
      const firstState = exampleReducer(entitiesState, actions.setExample({stateDetails: {}}));
      expect(Object.keys(firstState).length).toEqual(2);
    });

    it('RESET action should return initial state', () => {
      const state = exampleReducer(entitiesState, actions.resetExample());
      expect(state).toEqual(exampleInitialState);
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
      const secondState = exampleReducer(firstState,
        actions.setExample({stateDetails: {}}));
      const thirdState = exampleReducer(secondState, actions.clearExampleEntities());
      expect(thirdState.ids.length).toEqual(0);
    });
  });
});

`;
