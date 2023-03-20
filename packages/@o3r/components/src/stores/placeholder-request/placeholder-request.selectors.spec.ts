import * as selectors from './placeholder-request.selectors';
import { PlaceholderRequestState } from './placeholder-request.state';

const entity = { id: 'www.google.com', resolvedUrl: 'www.google.com', template: '<span>ok</span>', requestIds: [] as any[], vars: {} };
const entities = { tpl1: entity };
const state: PlaceholderRequestState = { entities, ids: Object.keys(entities), requestIds: [] };

describe('PlaceholderRequest Selectors tests', () => {

  it('should return undefined if requested ID is not in the state', () => {
    expect(selectors.selectPlaceholderRequestEntityUsage('random')(state)).toBeUndefined();
  });

  it('should return the correct entity if requested ID is in the state', () => {
    expect(selectors.selectPlaceholderRequestEntityUsage('www.google.com')(state)).toBeUndefined();
  });
});
