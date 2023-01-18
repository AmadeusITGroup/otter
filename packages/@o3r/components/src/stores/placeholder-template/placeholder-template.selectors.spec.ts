import { placeholderTemplateInitialState } from './placeholder-template.reducer';
import * as selectors from './placeholder-template.selectors';
import { PlaceholderTemplateState } from './placeholder-template.state';

const entity = { id: 'tpl1', url: 'www.google.com', resolvedUrl: 'www.google.com', template: '<span>ok</span>', requestIds: [] as any[], vars: {} };
const entities = { tpl1: entity };
const state: PlaceholderTemplateState = { entities, ids: Object.keys(entities), requestIds: [] };

describe('PlaceholderTemplate Selectors tests', () => {
  it('should provide the pending status of the store', () => {
    expect(selectors.selectPlaceholderTemplateStorePendingStatus.projector(placeholderTemplateInitialState)).toBeFalsy();
    expect(selectors.selectPlaceholderTemplateStorePendingStatus.projector({...placeholderTemplateInitialState, isPending: false})).toBe(false);
    expect(selectors.selectPlaceholderTemplateStorePendingStatus.projector({...placeholderTemplateInitialState, isPending: true})).toBe(true);
  });

  it('should return undefined if requested ID is not in the state', () => {
    expect(selectors.selectPlaceholderTemplateEntity.projector(state, { id: 'random' })).toBeUndefined();
  });

  it('should return the correct entity if requested ID is in the state', () => {
    expect(selectors.selectPlaceholderTemplateEntity.projector(state, { id: 'tpl1' })).toEqual(entity);
  });
});
