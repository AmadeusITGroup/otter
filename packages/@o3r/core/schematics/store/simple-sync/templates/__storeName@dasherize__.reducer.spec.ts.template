import * as actions from './<%= fileName %>.actions';
import {<%= cStoreName %>InitialState, <%= cStoreName %>Reducer} from './<%= fileName %>.reducer';
import {<%= storeName %>State} from './<%= fileName %>.state';

describe('<%= storeName %> Store reducer', () => {

  const simpleState: <%= storeName %>State = {};
  const first<%= storeName %>: any = {id: '<%= cStoreName %>1', genericItems: []};
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
      const firstState = <%= cStoreName %>Reducer({model : first<%= storeName %>}, actions.update<%= storeName %>({model : second<%= storeName %>}));
      expect(firstState.model!.id).toEqual('<%= cStoreName %>2');
    });

    it('RESET action should return initial state', () => {
      const state = <%= cStoreName %>Reducer(simpleState, actions.reset<%= storeName %>());
      expect(state).toEqual(<%= cStoreName %>InitialState);
    });
  });
});
