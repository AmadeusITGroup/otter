import {contactInitialState} from './contact.reducer';
import * as selectors from './contact.selectors';

describe('Contact Selectors tests', () => {
  it('should provide the pending status of the store', () => {
    expect(selectors.selectContactStorePendingStatus.projector(contactInitialState)).toBeFalsy();
    expect(selectors.selectContactStorePendingStatus.projector({...contactInitialState, isPending: false})).toBe(false);
    expect(selectors.selectContactStorePendingStatus.projector({...contactInitialState, isPending: true})).toBe(true);
  });
});
