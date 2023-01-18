export const syncEntityReducerContent = `import {createEntityAdapter, EntityAdapter} from '@ngrx/entity';
import {ActionCreator, createReducer, on, ReducerTypes} from '@ngrx/store';
import * as actions from './air-offers.actions';

import {AirOffersState, AirOffersStateDetails, AirOfferModel} from './air-offers.state';

/**
 * AirOffers Store adapter
 */
export const airOffersAdapter: EntityAdapter<AirOfferModel> = createEntityAdapter<AirOfferModel>({
  selectId: (model) => model.id
});

/**
 * AirOffers Store initial value
 */
export const airOffersInitialState: AirOffersState = airOffersAdapter.getInitialState<AirOffersStateDetails>({});

/**
 *  List of basic actions for AirOffers Store
 */
export const airOffersReducerFeatures: ReducerTypes<AirOffersState, ActionCreator[]>[] = [
  on(actions.setAirOffers, (state, payload) => ({ids: state.ids, entities: state.entities, ...payload.stateDetails})),

  on(actions.updateAirOffers, (state, payload) => ({...state, ...payload.stateDetails})),

  on(actions.resetAirOffers, () => airOffersInitialState),

  on(actions.setAirOffersEntities, (state, payload) => airOffersAdapter.addMany(payload.entities, airOffersAdapter.removeAll(state))),

  on(actions.updateAirOffersEntities, (state, payload) =>
    airOffersAdapter.updateMany(payload.entities.map((entity) => ({id: entity.id, changes: entity})), state)),

  on(actions.upsertAirOffersEntities, (state, payload) => airOffersAdapter.upsertMany(payload.entities, state)),

  on(actions.clearAirOffersEntities, (state) =>  airOffersAdapter.removeAll(state))
];

/**
 * AirOffers Store reducer
 */
export const airOffersReducer = createReducer(
  airOffersInitialState,
  ...airOffersReducerFeatures
);

`;
