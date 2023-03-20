import {createEntityAdapter} from '@ngrx/entity';
import {ActionCreator, createReducer, on, ReducerTypes} from '@ngrx/store';
import * as actions from './placeholder-template.actions';
import {
  PlaceholderTemplateModel,
  PlaceholderTemplateState
} from './placeholder-template.state';

/**
 * PlaceholderTemplate Store adapter
 */
export const placeholderTemplateAdapter = createEntityAdapter<PlaceholderTemplateModel>({
  selectId: (model) => model.id
});

/**
 * PlaceholderTemplate Store initial value
 */
export const placeholderTemplateInitialState: PlaceholderTemplateState = placeholderTemplateAdapter.getInitialState();

/**
 * List of basic actions for PlaceholderTemplate Store
 */
export const placeholderTemplateReducerFeatures: ReducerTypes<PlaceholderTemplateState, ActionCreator[]>[] = [
  on(actions.setPlaceholderTemplateEntity, (state, payload) =>
    placeholderTemplateAdapter.addOne(payload.entity, placeholderTemplateAdapter.removeOne(payload.entity.id, state))),
  on(actions.deletePlaceholderTemplateEntity, (state, payload) => {
    const id = payload.id;
    if (!id || !state.entities[id]) {
      return state;
    }
    return placeholderTemplateAdapter.removeOne(id, state);
  })
];

/**
 * PlaceholderTemplate Store reducer
 */
export const placeholderTemplateReducer = createReducer(
  placeholderTemplateInitialState,
  ...placeholderTemplateReducerFeatures
);
