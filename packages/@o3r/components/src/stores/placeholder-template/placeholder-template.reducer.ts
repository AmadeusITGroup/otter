import { createEntityAdapter } from '@ngrx/entity';
import { ActionCreator, createReducer, on, ReducerTypes } from '@ngrx/store';
import { asyncStoreItemAdapter, createEntityAsyncRequestAdapter } from '@o3r/core';
import * as actions from './placeholder-template.actions';
import {
  PlaceholderTemplateModel,
  PlaceholderTemplateState,
  PlaceholderTemplateStateDetails
} from './placeholder-template.state';

/**
 * PlaceholderTemplate Store adapter
 */
export const placeholderTemplateAdapter = createEntityAsyncRequestAdapter(createEntityAdapter<PlaceholderTemplateModel>({
  selectId: (model) => model.id
}));

/**
 * PlaceholderTemplate Store initial value
 */
export const placeholderTemplateInitialState: PlaceholderTemplateState = placeholderTemplateAdapter.getInitialState<PlaceholderTemplateStateDetails>({
  requestIds: []
});

/**
 * List of basic actions for PlaceholderTemplate Store
 */
export const placeholderTemplateReducerFeatures: ReducerTypes<PlaceholderTemplateState, ActionCreator[]>[] = [
  on(actions.cancelPlaceholderTemplateRequest, (state, action) => {
    const id = action.id;
    if (!id || !state.entities[id]) {
      return state;
    }
    return placeholderTemplateAdapter.updateOne({id: action.id, changes: asyncStoreItemAdapter.resolveRequest(state.entities[id]!, action.requestId)}, state);
  }),
  on(actions.setPlaceholderTemplateEntity, (state, payload) => {
    const placeholderModel = state.entities[payload.entity.id];
    return placeholderTemplateAdapter.resolveRequestOne(state, {
      ...placeholderModel,
      ...payload.entity
    }, payload.requestId);
  }),
  on(actions.setPlaceholderTemplateEntityFromUrl, (state, payload) =>
    placeholderTemplateAdapter.addRequestOne(placeholderTemplateAdapter.upsertOne(
      asyncStoreItemAdapter.initialize({
        id: payload.id,
        url: payload.url,
        resolvedUrl: payload.resolvedUrl
      }), state), payload.id, payload.requestId)
  ),
  on(actions.failPlaceholderTemplateEntity, (state, payload) => {
    return placeholderTemplateAdapter.failRequestMany(asyncStoreItemAdapter.resolveRequest(state, payload.requestId), payload && payload.ids, payload.requestId);
  }),
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
