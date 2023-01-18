import * as actions from './config-override.actions';
import {configOverrideInitialState, configOverrideReducer} from './config-override.reducer';
import {ConfigOverrideState} from './config-override.state';

describe('ConfigOverride Store reducer', () => {

  let state: ConfigOverrideState;
  const firstConfigOverride: any = {name: 'configOverride1', overrides: []};
  const secondConfigOverride: any = {name: 'configOverride2', overrides: []};

  it('should have the correct initial state', () => {
    state = configOverrideReducer(configOverrideInitialState, {type: 'fake'} as any);

    expect(state).toEqual(configOverrideInitialState);
  });

  it('Action SET action should clear current cart state details and return a state with the new one', () => {
    state = {configOverrides: {}};
    const firstState = configOverrideReducer(state, actions.setConfigOverride({state: {configOverrides: firstConfigOverride}}));

    expect(Object.keys(firstState).length).toEqual(1);
    const secondState = configOverrideReducer(firstState, actions.setConfigOverride({state: {configOverrides: secondConfigOverride}}));

    expect(Object.keys(secondState).length).toEqual(1);
  });
});
