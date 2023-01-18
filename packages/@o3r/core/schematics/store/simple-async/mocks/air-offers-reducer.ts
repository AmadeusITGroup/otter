export const asyncSimpleReducerContent = `import {ActionCreator, createReducer, on, ReducerTypes} from '@ngrx/store';
import {asyncStoreItemAdapter} from '@o3r/core';
import * as actions from './air-offers.actions';
import {AirOffersState} from './air-offers.state';

/**
 * airOffers initial state
 */
export const airOffersInitialState: AirOffersState = {
  model: null,
  requestIds: []
};

/**
 * List of basic actions for AirOffers Store
 */
export const airOffersReducerFeatures: ReducerTypes<AirOffersState, ActionCreator[]>[] = [

  on(actions.setAirOffers, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest({...asyncStoreItemAdapter.extractAsyncStoreItem(state), ...payload}, payload.requestId)
  ),

  on(actions.updateAirOffers, (state, payload) => asyncStoreItemAdapter.resolveRequest({...state, ...payload}, payload.requestId)),

  on(actions.resetAirOffers, () => airOffersInitialState),

  on(actions.cancelAirOffersRequest, (state, action) => asyncStoreItemAdapter.resolveRequest(state, action.requestId)),

  on(actions.failAirOffers, (state, payload) => asyncStoreItemAdapter.failRequest(state, payload.requestId)),

  on(actions.setAirOffersFromApi, actions.updateAirOffersFromApi, (state, payload) =>
    asyncStoreItemAdapter.addRequest(state, payload.requestId))
];

/**
 * AirOffers Store reducer
 */
export const airOffersReducer = createReducer(
  airOffersInitialState,
  ...airOffersReducerFeatures
);
`;

