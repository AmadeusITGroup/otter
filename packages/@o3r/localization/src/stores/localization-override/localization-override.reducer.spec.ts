import * as actions from './localization-override.actions';
import {localizationOverrideInitialState, localizationOverrideReducer} from './localization-override.reducer';
import {LocalizationOverrideState} from './localization-override.state';

describe('LocalizationOverride Store reducer', () => {

  let state: LocalizationOverrideState;
  const firstLocalizationOverride = {key: 'localizationOverrideKey1', value: 'localizationOverrideValue1'};
  const secondLocalizationOverride = {key: 'localizationOverrideKey2', value: 'localizationOverrideValue2'};

  it('should by default return the initial state', () => {
    state = localizationOverrideReducer(localizationOverrideInitialState, {type: 'fake'} as any);

    expect(state).toEqual(localizationOverrideInitialState);
  });

  it('Action SET should clear current cart state details and return a state with the new one', () => {
    state = {localizationOverrides: {}};
    const firstState = localizationOverrideReducer(state, actions.setLocalizationOverride({state: {localizationOverrides: firstLocalizationOverride}}));

    expect(Object.keys(firstState).length).toEqual(1);
    const secondState = localizationOverrideReducer(state, actions.setLocalizationOverride({state: {localizationOverrides: secondLocalizationOverride}}));

    expect(Object.keys(secondState).length).toEqual(1);
  });
});
