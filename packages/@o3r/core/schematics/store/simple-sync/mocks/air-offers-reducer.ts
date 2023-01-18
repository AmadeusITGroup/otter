export const syncSimpleReducerContent = `import {ActionCreator, createReducer, on, ReducerTypes} from '@ngrx/store';
import * as actions from './air-offers.actions';
import {AirOffersState} from './air-offers.state';

/**
 * airOffers initial state
 */
export const airOffersInitialState: AirOffersState = {};

/**
 * List of basic actions for AirOffers Store
 */
export const airOffersReducerFeatures: ReducerTypes<AirOffersState, ActionCreator[]>[] = [
  on(actions.setAirOffers, (_state, payload) => ({...payload.model})),

  on(actions.updateAirOffers, (state, payload) => ({...state, ...payload.model})),

  on(actions.resetAirOffers, () => airOffersInitialState)
];

/**
 * AirOffers Store reducer
 */
export const airOffersReducer = createReducer(
  airOffersInitialState,
  ...airOffersReducerFeatures
);
`;
