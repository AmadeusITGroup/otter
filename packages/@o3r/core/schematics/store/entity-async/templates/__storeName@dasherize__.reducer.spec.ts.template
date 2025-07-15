import * as actions from './<%= fileName %>.actions';
import {<%= cStoreName %>InitialState, <%= cStoreName %>Reducer} from './<%= fileName %>.reducer';
import {<%= storeName %>State} from './<%= fileName %>.state';

describe('<%= storeName %> Store reducer', () => {

  let entitiesState: <%= storeName %>State;
  const first<%= storeName %>: any = {<%= modelIdPropName %>: '<%= cStoreName %>1', genericItems: []};
  const second<%= storeName %>: any = {<%= modelIdPropName %>: '<%= cStoreName %>2', genericItems: []};
  const <%= cStoreName %>Reply: any = [first<%= storeName %>];

  it('should have the correct initial state', () => {
    expect(<%= cStoreName %>InitialState.ids.length).toBe(0);
  });


  it('should by default return the initial state', () => {
    const state = <%= cStoreName %>Reducer(<%= cStoreName %>InitialState, {type: 'fake'} as any);
    expect(state).toEqual(<%= cStoreName %>InitialState);
  });

  describe('Actions on state details ', () => {
    beforeEach(() => {
      entitiesState = <%= cStoreName %>Reducer(<%= cStoreName %>InitialState, actions.set<%= storeName %>Entities({entities: [first<%= storeName %>, second<%= storeName %>]}));
    });

    it('SET action should clear current state details and return a state with the new one', () => {
      const firstState = <%= cStoreName %>Reducer(entitiesState, actions.set<%= storeName %>({stateDetails: {requestIds: []}}));
      const secondState = <%= cStoreName %>Reducer(firstState, actions.set<%= storeName %>({stateDetails: {requestIds: [], isPending: false}}));
      expect(secondState.isPending).toEqual(false);
    });

    it('UPDATE should update the state details without modifying entities', () => {
      const firstState = <%= cStoreName %>Reducer(entitiesState, actions.set<%= storeName %>({stateDetails: {requestIds: []}}));
      const secondState = <%= cStoreName %>Reducer(firstState, actions.update<%= storeName %>({stateDetails: {isPending: false}}));
      expect(secondState.isPending).toEqual(false);
    });

    it('RESET action should return initial state', () => {
      const state = <%= cStoreName %>Reducer(entitiesState, actions.reset<%= storeName %>());
      expect(state).toEqual(<%= cStoreName %>InitialState);
    });

    it('FAIL action should update the isPending to false and the isFailure to true', () => {
      const state = <%= cStoreName %>Reducer({...<%= cStoreName %>InitialState, isPending: true}, actions.fail<%= storeName %>Entities({}));
      expect(state.ids.length).toBe(0);
      expect(state.isPending).toBe(false);
      expect(state.isFailure).toBe(true);
    });
  });

  describe('Entity actions', () => {
    it('SET_ENTITIES action should clear current entities and set new ones', () => {
      const firstState = <%= cStoreName %>Reducer(<%= cStoreName %>InitialState, actions.set<%= storeName %>Entities({entities: [first<%= storeName %>]}));
      const secondState = <%= cStoreName %>Reducer(firstState, actions.set<%= storeName %>Entities({entities: [second<%= storeName %>]}));
      expect(secondState.ids.length).toEqual(1);
      expect((secondState.ids as string[]).find((id) => (id === first<%= storeName %>.<%= modelIdPropName %>))).toBeUndefined();
      expect((secondState.ids as string[]).find((id) => (id === second<%= storeName %>.<%= modelIdPropName %>))).toBeDefined();
    });

    it('UPDATE_ENTITTIES action should only update existing entities', () => {
      const first<%= storeName %>Updated = {...first<%= storeName %>, genericField: 'genericId'};
      const firstState = <%= cStoreName %>Reducer(<%= cStoreName %>InitialState, actions.set<%= storeName %>Entities({entities: [first<%= storeName %>]}));
      const secondState = <%= cStoreName %>Reducer(firstState,
        actions.update<%= storeName %>Entities({entities: [first<%= storeName %>Updated, second<%= storeName %>]}));
      expect(secondState.ids.length).toEqual(1);
      expect((secondState.ids as string[]).find((id) => (id === first<%= storeName %>.<%= modelIdPropName %>))).toBeDefined();
      expect((secondState.ids as string[]).find((id) => (id === second<%= storeName %>.<%= modelIdPropName %>))).toBeUndefined();
    });

    it('UPSERT_ENTITIES action should update existing entities and add the new ones', () => {
      const first<%= storeName %>Updated = {...first<%= storeName %>, genericField: 'genericId'};
      const firstState = <%= cStoreName %>Reducer(<%= cStoreName %>InitialState, actions.set<%= storeName %>Entities({entities: [first<%= storeName %>]}));
      const secondState = <%= cStoreName %>Reducer(firstState,
        actions.upsert<%= storeName %>Entities({entities: [first<%= storeName %>Updated, second<%= storeName %>]}));
      expect(secondState.ids.length).toEqual(2);
      expect((secondState.ids as string[]).find((id) => (id === first<%= storeName %>.<%= modelIdPropName %>))).toBeDefined();
      expect((secondState.ids as string[]).find((id) => (id === second<%= storeName %>.<%= modelIdPropName %>))).toBeDefined();
    });

    it('CLEAR_ENTITIES action should clear only the entities', () => {
      const firstState = <%= cStoreName %>Reducer(<%= cStoreName %>InitialState, actions.set<%= storeName %>Entities({entities: [first<%= storeName %>, second<%= storeName %>]}));
      const secondState = <%= cStoreName %>Reducer(firstState, actions.set<%= storeName %>({stateDetails: {requestIds: [], isPending: false}}));
      const thirdState = <%= cStoreName %>Reducer(secondState, actions.clear<%= storeName %>Entities());
      expect(thirdState.ids.length).toEqual(0);
    });

    it('FAIL_ENTITIES action should update the isPending to false and the isFailure to true', () => {
      const state = <%= cStoreName %>Reducer({...<%= cStoreName %>InitialState, isPending: true}, actions.fail<%= storeName %>Entities({}));
      expect(state.ids.length).toBe(0);
      expect(state.isPending).toBe(false);
      expect(state.isFailure).toBe(true);
    });

    it('FAIL_ENTITIES action should update the global isPending to false in case there are some newIds in the payload', () => {
      const firstState = <%= cStoreName %>Reducer(<%= cStoreName %>InitialState, actions.set<%= storeName %>Entities({entities: [first<%= storeName %>]}));
      const secondState = <%= cStoreName %>Reducer({...firstState, isPending : true},
        actions.fail<%= storeName %>Entities({error: 'dummy error', ids: [second<%= storeName %>.id]}));
      expect(secondState.isPending).toBe(false);
      expect(secondState.isFailure).toBe(true);
    });
  });

  describe('API call actions', () => {
    it('SET_ENTITIES_FROM_API action should clear current entities and set new ones', () => {
      const firstState = <%= cStoreName %>Reducer(<%= cStoreName %>InitialState, actions.set<%= storeName %>EntitiesFromApi({call: Promise.resolve(<%= cStoreName %>Reply), requestId: 'test'}));
      expect(firstState.isPending).toEqual(true);
    });
    it('UPDATE_ENTITIES_FROM_API action should clear current entities and set new ones', () => {
      const firstState = <%= cStoreName %>Reducer(<%= cStoreName %>InitialState, actions.set<%= storeName %>Entities({entities: [first<%= storeName %>]}));
      const secondState = <%= cStoreName %>Reducer(firstState,
        actions.update<%= storeName %>EntitiesFromApi({call: Promise.resolve(<%= cStoreName %>Reply), ids: [first<%= storeName %>.<%= modelIdPropName %>], requestId: 'test'}));
      expect(secondState.isPending).toBeFalsy();
      expect(secondState.entities[first<%= storeName %>.<%= modelIdPropName %>]!.isPending).toEqual(true);
    });
    it('UPSERT_ENTITIES_FROM_API action should clear current entities and set new ones', () => {
      const firstState = <%= cStoreName %>Reducer(<%= cStoreName %>InitialState, actions.upsert<%= storeName %>EntitiesFromApi({call: Promise.resolve(<%= cStoreName %>Reply), requestId: 'test'}));
      expect(firstState.isPending).toEqual(true);
    });
  });
});
