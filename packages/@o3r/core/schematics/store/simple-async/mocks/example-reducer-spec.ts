export const asyncSimpleReducerSpecContent = `import * as actions from './example.actions';
import {exampleInitialState, exampleReducer} from './example.reducer';
import {ExampleState} from './example.state';

describe('Example Store reducer', () => {

  const simpleState: ExampleState = {model : null, requestIds: []};
  const firstExample: any = {id: 'example1', genericItems: []};
  const exampleReply: any = {data: {model: firstExample}};
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
      const firstState = exampleReducer({model : firstExample, requestIds: []}, actions.updateExample({model : secondExample}));
      expect(firstState.model!.id).toEqual('example2');
    });

    it('RESET action should return initial state', () => {
      const state = exampleReducer(simpleState, actions.resetExample());
      expect(state).toEqual(exampleInitialState);
    });

    it('FAIL action should update the isPending to false and the isFailure to true', () => {
      const state = exampleReducer({...exampleInitialState, isPending: true}, actions.failExample({error: {}}));
      expect(state.isPending).toBe(false);
      expect(state.isFailure).toBe(true);
    });
  });

  describe('API call actions', () => {
    it('SET_FROM_API action should clear current entities and set new ones', () => {
      const firstState = exampleReducer(exampleInitialState, actions.setExampleFromApi({call: Promise.resolve(exampleReply), requestId: 'test'}));
      expect(firstState.isPending).toEqual(true);
    });
    it('UPDATE_FROM_API action should clear current entities and set new ones', () => {
      const firstState = exampleReducer(exampleInitialState, actions.setExample({model: firstExample}));
      const secondState = exampleReducer(firstState, actions.updateExampleFromApi({call: Promise.resolve(exampleReply), requestId: 'test'}));
      expect(secondState.isPending).toEqual(true);
    });
  });
});

`;
