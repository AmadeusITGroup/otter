import {petInitialState} from './pet.reducer';
import * as selectors from './pet.selectors';

describe('Pet Selectors tests', () => {
  it('should provide the pending status of the store', () => {
    expect(selectors.selectPetStorePendingStatus.projector(petInitialState)).toBeFalsy();
    expect(selectors.selectPetStorePendingStatus.projector({...petInitialState, isPending: false})).toBe(false);
    expect(selectors.selectPetStorePendingStatus.projector({...petInitialState, isPending: true})).toBe(true);
  });
});
