import {petstoreInitialState} from './petstore.reducer';
import * as selectors from './petstore.selectors';

describe('Petstore Selectors tests', () => {
  it('should provide the pending status of the store', () => {
    expect(selectors.selectPetstoreStorePendingStatus.projector(petstoreInitialState)).toBeFalsy();
    expect(selectors.selectPetstoreStorePendingStatus.projector({...petstoreInitialState, isPending: false})).toBe(false);
    expect(selectors.selectPetstoreStorePendingStatus.projector({...petstoreInitialState, isPending: true})).toBe(true);
  });
});
