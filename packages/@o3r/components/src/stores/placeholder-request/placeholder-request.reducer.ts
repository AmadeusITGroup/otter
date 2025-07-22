import {
  createEntityAdapter,
} from '@ngrx/entity';
import {
  ActionCreator,
  createReducer,
  on,
  ReducerTypes,
} from '@ngrx/store';
import {
  asyncStoreItemAdapter,
  createEntityAsyncRequestAdapter,
} from '@o3r/core';
import * as actions from './placeholder-request.actions';
import {
  PlaceholderRequestModel,
  PlaceholderRequestState,
  PlaceholderRequestStateDetails,
} from './placeholder-request.state';

/**
 * PlaceholderRequest Store adapter
 */
export const placeholderRequestAdapter = createEntityAsyncRequestAdapter(createEntityAdapter<PlaceholderRequestModel>({
  selectId: (model) => model.id
}));

/**
 * PlaceholderRequest Store initial value
 */
export const placeholderRequestInitialState: PlaceholderRequestState = placeholderRequestAdapter.getInitialState<PlaceholderRequestStateDetails>({
  requestIds: []
});

/**
 * Reducers of Placeholder request store that handles the call to the placeholder template URL
 */
export const placeholderRequestReducerFeatures: ReducerTypes<PlaceholderRequestState, ActionCreator[]>[] = [
  on(actions.cancelPlaceholderRequest, (state, action) => {
    const id = action.id;
    if (!id || !state.entities[id]) {
      return state;
    }
    return placeholderRequestAdapter.updateOne({
      id: action.id,
      changes: asyncStoreItemAdapter.resolveRequest(state.entities[id], action.requestId)
    }, asyncStoreItemAdapter.resolveRequest(state, action.requestId));
  }),
  on(actions.updatePlaceholderRequestEntity, (state, action) => {
    const currentEntity = state.entities[action.entity.id]!;
    const newEntity = asyncStoreItemAdapter.resolveRequest({ ...action.entity, ...asyncStoreItemAdapter.extractAsyncStoreItem(currentEntity) }, action.requestId);
    return placeholderRequestAdapter.updateOne({
      id: newEntity.id,
      changes: newEntity
    }, asyncStoreItemAdapter.resolveRequest(state, action.requestId));
  }),
  on(actions.updatePlaceholderRequestEntitySync, (state, action) => {
    return placeholderRequestAdapter.updateOne({
      id: action.entity.id,
      changes: {
        ...action.entity
      }
    }, state);
  }),
  on(actions.setPlaceholderRequestEntityFromUrl, (state, payload) => {
    const currentEntity = state.entities[payload.id];
    // Nothing to update if resolved URLs already match
    if (currentEntity && currentEntity.resolvedUrl === payload.resolvedUrl) {
      return state;
    }
    let newEntity = {
      id: payload.id,
      resolvedUrl: payload.resolvedUrl,
      used: true
    };
    if (currentEntity) {
      newEntity = { ...asyncStoreItemAdapter.extractAsyncStoreItem(currentEntity), ...newEntity };
    }
    return placeholderRequestAdapter.addOne(
      asyncStoreItemAdapter.addRequest(
        asyncStoreItemAdapter.initialize(newEntity),
        payload.requestId),
      asyncStoreItemAdapter.addRequest(state, payload.requestId)
    );
  }),
  on(actions.failPlaceholderRequestEntity, (state, payload) => {
    return placeholderRequestAdapter.failRequestMany(asyncStoreItemAdapter.resolveRequest(state, payload.requestId), payload && payload.ids, payload.requestId);
  })
];

/**
 * PlaceholderRequest Store reducer
 */
export const placeholderRequestReducer = createReducer(
  placeholderRequestInitialState,
  ...placeholderRequestReducerFeatures
);
