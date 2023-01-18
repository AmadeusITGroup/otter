import {ActionCreator, createReducer, on, ReducerTypes} from '@ngrx/store';
import {createEntityAdapter} from '@ngrx/entity';
import {asyncStoreItemAdapter, createEntityAsyncRequestAdapter} from '@o3r/core';
import * as actions from './<%= fileName %>.actions';
import {<%= storeName %>State, <%= storeName %>StateDetails, <%= storeModelName %>} from './<%= fileName %>.state';

/**
 * <%= storeName %> Store adapter
 */
export const <%= cStoreName %>Adapter = createEntityAsyncRequestAdapter(createEntityAdapter<<%= storeModelName %>>({
  selectId: (model) => model.<%= modelIdPropName %>
}));

/**
 * <%= storeName %> Store initial value
 */
export const <%= cStoreName %>InitialState: <%= storeName %>State = <%= cStoreName %>Adapter.getInitialState<<%= storeName %>StateDetails>({
  requestIds: []
});

/**
 * List of basic actions for <%= storeName %> Store
 */
export const <%= cStoreName %>ReducerFeatures: ReducerTypes<<%= storeName %>State, ActionCreator[]>[] = [
  on(actions.reset<%= storeName %>, () => <%= cStoreName %>InitialState),

  on(actions.set<%= storeName %>, (state, payload) => ({ids: state.ids, entities: state.entities, ...payload.stateDetails})),

  on(actions.cancel<%= storeName %>Request, (state, action) => asyncStoreItemAdapter.resolveRequest(state, action.requestId)),

  on(actions.update<%= storeName %>, (state, payload) => ({...state, ...payload.stateDetails})),

  on(actions.set<%= storeName %>Entities, (state, payload) =>
    <%= cStoreName %>Adapter.addMany(
      payload.entities.map((entity) => asyncStoreItemAdapter.initialize(entity)),
      <%= cStoreName %>Adapter.removeAll(asyncStoreItemAdapter.resolveRequest(state, payload.requestId)))
  ),

  on(actions.update<%= storeName %>Entities, (state, payload) =>
    <%= cStoreName %>Adapter.resolveRequestMany(state, payload.entities, payload.requestId<% if(hasCustomId) {%>, '<%=modelIdPropName%>'<% } %>)
  ),

  on(actions.upsert<%= storeName %>Entities, (state, payload) =>
    <%= cStoreName %>Adapter.upsertMany(
      payload.entities.map((entity) => asyncStoreItemAdapter.initialize(entity)),
      asyncStoreItemAdapter.resolveRequest(state, payload.requestId)
    )
  ),

  on(actions.clear<%= storeName %>Entities, (state) =>  <%= cStoreName %>Adapter.removeAll(state)),

  on(actions.fail<%= storeName %>Entities, (state, payload) =>
    <%= cStoreName %>Adapter.failRequestMany(state, payload && payload.ids, payload.requestId)
  ),

  on(actions.set<%= storeName %>EntitiesFromApi, actions.upsert<%= storeName %>EntitiesFromApi, (state, payload) =>
    asyncStoreItemAdapter.addRequest(state, payload.requestId)),

  on(actions.update<%= storeName %>EntitiesFromApi, (state, payload) =>
    <%= cStoreName %>Adapter.addRequestMany(state, payload.ids, payload.requestId))
];

/**
 * <%= storeName %> Store reducer
 */
export const <%= cStoreName %>Reducer = createReducer(
  <%= cStoreName %>InitialState,
  ...<%= cStoreName %>ReducerFeatures
);
