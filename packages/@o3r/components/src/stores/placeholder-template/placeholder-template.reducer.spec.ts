import * as actions from './placeholder-template.actions';
import {placeholderTemplateInitialState, placeholderTemplateReducer} from './placeholder-template.reducer';

describe('PlaceholderTemplate Store reducer', () => {

  it('should have the correct initial state', () => {
    expect(placeholderTemplateInitialState.ids.length).toBe(0);
  });

  it('should by default return the initial state', () => {
    const state = placeholderTemplateReducer(placeholderTemplateInitialState, {type: 'fake'} as any);
    expect(state).toEqual(placeholderTemplateInitialState);
  });
  it('ACTION_DELETE_ENTITY and ACTION_SET_ENTITY actions should work properly', () => {
    const initialState = placeholderTemplateReducer(placeholderTemplateInitialState, actions.setPlaceholderTemplateEntity({
      entity: {
        id: 'o3r-my-placeholder',
        urlsWithPriority: [
          {rawUrl: 'www.url1.com/[LANG]', priority: 0},
          {rawUrl: 'www.url2.com/[LANG]', priority: 1}
        ]
      }
    }));
    expect(initialState.ids.length).toEqual(1);
    expect(initialState.entities['o3r-my-placeholder']).toBeDefined();

    const firstState = placeholderTemplateReducer(placeholderTemplateInitialState, actions.deletePlaceholderTemplateEntity({id:'o3r-my-placeholder'}));
    expect(firstState.ids.length).toEqual(0);
  });
});
