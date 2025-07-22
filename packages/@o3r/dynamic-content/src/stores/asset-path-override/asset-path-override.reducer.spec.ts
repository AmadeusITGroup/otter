import * as actions from './asset-path-override.actions';
import {
  assetPathOverrideInitialState,
  assetPathOverrideReducer,
} from './asset-path-override.reducer';
import {
  AssetPathOverrideState,
} from './asset-path-override.state';

describe('AssetPathOverride Store reducer', () => {
  let state: AssetPathOverrideState;
  const firstAssetPathOverride = { asset: 'assetPathOverride1', value: 'assetPathOverride1' };
  const secondAssetPathOverride = { asset: 'assetPathOverride2', value: 'assetPathOverride2' };

  it('should by default return the initial state', () => {
    state = assetPathOverrideReducer(assetPathOverrideInitialState, { type: 'fake' } as any);

    expect(state).toEqual(assetPathOverrideInitialState);
  });

  it('Action SET should clear current cart state details and return a state with the new one', () => {
    state = { assetPathOverrides: {} };
    const firstState = assetPathOverrideReducer(state, actions.setAssetPathOverride({ state: { assetPathOverrides: firstAssetPathOverride } }));

    expect(Object.keys(firstState).length).toEqual(1);
    const secondState = assetPathOverrideReducer(firstState, actions.setAssetPathOverride({ state: { assetPathOverrides: secondAssetPathOverride } }));

    expect(Object.keys(secondState).length).toEqual(1);
  });
});
