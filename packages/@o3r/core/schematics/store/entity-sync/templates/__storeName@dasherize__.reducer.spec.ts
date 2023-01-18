import * as actions from './<%= fileName %>.actions';
import {<%= cStoreName %>InitialState, <%= cStoreName %>Reducer} from './<%= fileName %>.reducer';
import {<%= storeName %>State} from './<%= fileName %>.state';

describe('<%= storeName %> Store reducer', () => {

  let entitiesState: <%= storeName %>State;
  const first<%= storeName %>: any = {<%= modelIdPropName %>: '<%= cStoreName %>1', genericItems: []};
  const second<%= storeName %>: any = {<%= modelIdPropName %>: '<%= cStoreName %>2', genericItems: []};

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

    it('SET action should clear current cart state details and return a state with the new one', () => {
      const firstState = <%= cStoreName %>Reducer(entitiesState, actions.set<%= storeName %>({stateDetails: {}}));
      expect(Object.keys(firstState).length).toEqual(2);
    });

    it('UPDATE should update the state details without modifying entities', () => {
      const firstState = <%= cStoreName %>Reducer(entitiesState, actions.set<%= storeName %>({stateDetails: {}}));
      expect(Object.keys(firstState).length).toEqual(2);
    });

    it('RESET action should return initial state', () => {
      const state = <%= cStoreName %>Reducer(entitiesState, actions.reset<%= storeName %>());
      expect(state).toEqual(<%= cStoreName %>InitialState);
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
      const secondState = <%= cStoreName %>Reducer(firstState,
        actions.set<%= storeName %>({stateDetails: {}}));
      const thirdState = <%= cStoreName %>Reducer(secondState, actions.clear<%= storeName %>Entities());
      expect(thirdState.ids.length).toEqual(0);
    });
  });
});
