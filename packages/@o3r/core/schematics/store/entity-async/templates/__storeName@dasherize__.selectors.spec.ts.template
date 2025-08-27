import {<%= cStoreName %>InitialState} from './<%= fileName %>.reducer';
import * as selectors from './<%= fileName %>.selectors';

describe('<%= storeName %> Selectors tests', () => {
  it('should provide the pending status of the store', () => {
    expect(selectors.select<%= storeName %>StorePendingStatus.projector(<%= cStoreName %>InitialState)).toBeFalsy();
    expect(selectors.select<%= storeName %>StorePendingStatus.projector({...<%= cStoreName %>InitialState, isPending: false})).toBe(false);
    expect(selectors.select<%= storeName %>StorePendingStatus.projector({...<%= cStoreName %>InitialState, isPending: true})).toBe(true);
  });
});
