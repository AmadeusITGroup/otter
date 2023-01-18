import { createEntityAdapter } from '@ngrx/entity';
import { ActionCreator, createReducer, on, ReducerTypes } from '@ngrx/store';
import { asyncStoreItemAdapter } from '@o3r/core';
import * as actions from './rulesets.actions';
import { RulesetsModel, RulesetsState, RulesetsStateDetails } from './rulesets.state';

/**
 * Rulesets Store adapter
 */
export const rulesetsAdapter = createEntityAdapter<RulesetsModel>({
  selectId: (model) => model.id
});

/**
 * Rulesets Store initial value
 */
export const rulesetsInitialState: RulesetsState = rulesetsAdapter.getInitialState<RulesetsStateDetails>({
  requestIds: []
});

/**
 * List of basic actions for Rulesets Store
 */
export const rulesetsReducerFeatures: ReducerTypes<RulesetsState, ActionCreator[]>[] = [
  on(actions.resetRulesets, () => rulesetsInitialState),

  on(actions.setRulesets, (state, payload) => ({ids: state.ids, entities: state.entities, ...payload.stateDetails})),

  on(actions.cancelRulesetsRequest, (state, action) => asyncStoreItemAdapter.resolveRequest(state, action.requestId)),

  on(actions.updateRulesets, (state, payload) => ({...state, ...payload.stateDetails})),

  on(actions.setRulesetsEntities, (state, payload) =>
    rulesetsAdapter.addMany(
      payload.entities,
      rulesetsAdapter.removeAll(asyncStoreItemAdapter.resolveRequest(state, payload.requestId)))
  ),

  on(actions.upsertRulesetsEntities, (state, payload) =>
    rulesetsAdapter.upsertMany(payload.entities, asyncStoreItemAdapter.resolveRequest(state, payload.requestId))
  ),

  on(actions.clearRulesetsEntities, (state) => rulesetsAdapter.removeAll(state)),

  on(actions.failRulesetsEntities, (state, payload) =>
    asyncStoreItemAdapter.failRequest(state, payload.requestId)
  ),

  on(actions.setRulesetsEntitiesFromApi, actions.upsertRulesetsEntitiesFromApi, (state, payload) =>
    asyncStoreItemAdapter.addRequest(state, payload.requestId))
];

/**
 * Rulesets Store reducer
 */
export const rulesetsReducer = createReducer(
  rulesetsInitialState,
  ...rulesetsReducerFeatures
);
