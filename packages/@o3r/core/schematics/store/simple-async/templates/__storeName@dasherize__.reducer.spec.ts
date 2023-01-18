import * as actions from './<%= fileName %>.actions';
import {<%= cStoreName %>InitialState, <%= cStoreName %>Reducer} from './<%= fileName %>.reducer';
import {<%= storeName %>State} from './<%= fileName %>.state';

describe('<%= storeName %> Store reducer', () => {

  const simpleState: <%= storeName %>State = {model : null, requestIds: []};
  const first<%= storeName %>: any = {id: '<%= cStoreName %>1', genericItems: []};
  const <%= cStoreName %>Reply: any = {data: {model: first<%= storeName %>}};
  const second<%= storeName %>: any = {id: '<%= cStoreName %>2', genericItems: []};

  it('should by default return the initial state', () => {
    const state = <%= cStoreName %>Reducer(<%= cStoreName %>InitialState, {type: 'fake'} as any);
    expect(state).toEqual(<%= cStoreName %>InitialState);
  });

  describe('Actions on state details ', () => {

    it('SET action should clear current cart state details and return a state with the new one', () => {
      const firstState = <%= cStoreName %>Reducer(simpleState, actions.set<%= storeName %>({model : first<%= storeName %>}));
      expect(firstState.model!.id).toEqual('<%= cStoreName %>1');
    });

    it('UPDATE should update the state details without modifying entities', () => {
      const firstState = <%= cStoreName %>Reducer({model : first<%= storeName %>, requestIds: []}, actions.update<%= storeName %>({model : second<%= storeName %>}));
      expect(firstState.model!.id).toEqual('<%= cStoreName %>2');
    });

    it('RESET action should return initial state', () => {
      const state = <%= cStoreName %>Reducer(simpleState, actions.reset<%= storeName %>());
      expect(state).toEqual(<%= cStoreName %>InitialState);
    });

    it('FAIL action should update the isPending to false and the isFailure to true', () => {
      const state = <%= cStoreName %>Reducer({...<%= cStoreName %>InitialState, isPending: true}, actions.fail<%= storeName %>({error: {}}));
      expect(state.isPending).toBe(false);
      expect(state.isFailure).toBe(true);
    });
  });

  describe('API call actions', () => {
    it('SET_FROM_API action should clear current entities and set new ones', () => {
      const firstState = <%= cStoreName %>Reducer(<%= cStoreName %>InitialState, actions.set<%= storeName %>FromApi({call: Promise.resolve(<%= cStoreName %>Reply), requestId: 'test'}));
      expect(firstState.isPending).toEqual(true);
    });
    it('UPDATE_FROM_API action should clear current entities and set new ones', () => {
      const firstState = <%= cStoreName %>Reducer(<%= cStoreName %>InitialState, actions.set<%= storeName %>({model: first<%= storeName %>}));
      const secondState = <%= cStoreName %>Reducer(firstState, actions.update<%= storeName %>FromApi({call: Promise.resolve(<%= cStoreName %>Reply), requestId: 'test'}));
      expect(secondState.isPending).toEqual(true);
    });
  });
});
