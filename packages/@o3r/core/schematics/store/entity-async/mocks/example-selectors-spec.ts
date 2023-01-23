export const asyncEntitySelectorsSpecContent = `import {exampleInitialState} from './example.reducer';
import * as selectors from './example.selectors';

describe('Example Selectors tests', () => {
  it('should provide the pending status of the store', () => {
    expect(selectors.selectExampleStorePendingStatus.projector(exampleInitialState)).toBeFalsy();
    expect(selectors.selectExampleStorePendingStatus.projector({...exampleInitialState, isPending: false})).toBe(false);
    expect(selectors.selectExampleStorePendingStatus.projector({...exampleInitialState, isPending: true})).toBe(true);
  });
});

`;
