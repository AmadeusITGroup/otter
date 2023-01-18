export const syncEntityReducerContent = `import {createEntityAdapter, EntityAdapter} from '@ngrx/entity';
import {ActionCreator, createReducer, on, ReducerTypes} from '@ngrx/store';
import * as actions from './example.actions';

import {ExampleState, ExampleStateDetails, ExampleModel} from './example.state';

/**
 * Example Store adapter
 */
export const exampleAdapter: EntityAdapter<ExampleModel> = createEntityAdapter<ExampleModel>({
  selectId: (model) => model.id
});

/**
 * Example Store initial value
 */
export const exampleInitialState: ExampleState = exampleAdapter.getInitialState<ExampleStateDetails>({});

/**
 *  List of basic actions for Example Store
 */
export const exampleReducerFeatures: ReducerTypes<ExampleState, ActionCreator[]>[] = [
  on(actions.setExample, (state, payload) => ({ids: state.ids, entities: state.entities, ...payload.stateDetails})),

  on(actions.updateExample, (state, payload) => ({...state, ...payload.stateDetails})),

  on(actions.resetExample, () => exampleInitialState),

  on(actions.setExampleEntities, (state, payload) => exampleAdapter.addMany(payload.entities, exampleAdapter.removeAll(state))),

  on(actions.updateExampleEntities, (state, payload) =>
    exampleAdapter.updateMany(payload.entities.map((entity) => ({id: entity.id, changes: entity})), state)),

  on(actions.upsertExampleEntities, (state, payload) => exampleAdapter.upsertMany(payload.entities, state)),

  on(actions.clearExampleEntities, (state) =>  exampleAdapter.removeAll(state))
];

/**
 * Example Store reducer
 */
export const exampleReducer = createReducer(
  exampleInitialState,
  ...exampleReducerFeatures
);

`;
