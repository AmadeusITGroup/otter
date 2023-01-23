export const syncSimpleReducerSpecContent = `import * as actions from './example.actions';
import {exampleInitialState, exampleReducer} from './example.reducer';
import {ExampleState} from './example.state';

describe('Example Store reducer', () => {

  const simpleState: ExampleState = {};
  const firstExample: any = {id: 'example1', genericItems: []};
  const secondExample: any = {id: 'example2', genericItems: []};

  it('should by default return the initial state', () => {
    const state = exampleReducer(exampleInitialState, {type: 'fake'} as any);
    expect(state).toEqual(exampleInitialState);
  });

  describe('Actions on state details ', () => {

    it('SET action should clear current cart state details and return a state with the new one', () => {
      const firstState = exampleReducer(simpleState, actions.setExample({model : firstExample}));
      expect(firstState.model!.id).toEqual('example1');
    });

    it('UPDATE should update the state details without modifying entities', () => {
      const firstState = exampleReducer({model : firstExample}, actions.updateExample({model : secondExample}));
      expect(firstState.model!.id).toEqual('example2');
    });

    it('RESET action should return initial state', () => {
      const state = exampleReducer(simpleState, actions.resetExample());
      expect(state).toEqual(exampleInitialState);
    });
  });
});
`;
