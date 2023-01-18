export const asyncEntityReducerContent = `import {ActionCreator, createReducer, on, ReducerTypes} from '@ngrx/store';
import {createEntityAdapter} from '@ngrx/entity';
import {asyncStoreItemAdapter, createEntityAsyncRequestAdapter} from '@o3r/core';
import * as actions from './air-offers.actions';
import {AirOffersState, AirOffersStateDetails, AirOfferModel} from './air-offers.state';

/**
 * AirOffers Store adapter
 */
export const airOffersAdapter = createEntityAsyncRequestAdapter(createEntityAdapter<AirOfferModel>({
  selectId: (model) => model.id
}));

/**
 * AirOffers Store initial value
 */
export const airOffersInitialState: AirOffersState = airOffersAdapter.getInitialState<AirOffersStateDetails>({
  requestIds: []
});

/**
 * List of basic actions for AirOffers Store
 */
export const airOffersReducerFeatures: ReducerTypes<AirOffersState, ActionCreator[]>[] = [
  on(actions.resetAirOffers, () => airOffersInitialState),

  on(actions.setAirOffers, (state, payload) => ({ids: state.ids, entities: state.entities, ...payload.stateDetails})),

  on(actions.cancelAirOffersRequest, (state, action) => asyncStoreItemAdapter.resolveRequest(state, action.requestId)),

  on(actions.updateAirOffers, (state, payload) => ({...state, ...payload.stateDetails})),

  on(actions.setAirOffersEntities, (state, payload) => airOffersAdapter.addMany(
      payload.entities.map((entity) => asyncStoreItemAdapter.initialize(entity)),
      airOffersAdapter.removeAll(asyncStoreItemAdapter.resolveRequest(state, payload.requestId)))
  ),

  on(actions.updateAirOffersEntities, (state, payload) =>
    airOffersAdapter.resolveRequestMany(state, payload.entities, payload.requestId)
  ),

  on(actions.upsertAirOffersEntities, (state, payload) =>
    airOffersAdapter.upsertMany(
      payload.entities.map((entity) => asyncStoreItemAdapter.initialize(entity)),
      asyncStoreItemAdapter.resolveRequest(state, payload.requestId)
    )
  ),

  on(actions.clearAirOffersEntities, (state) =>  airOffersAdapter.removeAll(state)),

  on( actions.failAirOffersEntities, (state, payload) => airOffersAdapter.failRequestMany(state, payload && payload.ids, payload.requestId)),

  on(actions.setAirOffersEntitiesFromApi, actions.upsertAirOffersEntitiesFromApi, (state, payload) => asyncStoreItemAdapter.addRequest(state, payload.requestId)),

  on(actions.updateAirOffersEntitiesFromApi, (state, payload) =>
      airOffersAdapter.addRequestMany(state, payload.ids, payload.requestId))
];

/**
 * AirOffers Store reducer
 */
export const airOffersReducer = createReducer(
  airOffersInitialState,
  ...airOffersReducerFeatures
);`;
