export const syncSimpleReducerContent = `import {ActionCreator, createReducer, on, ReducerTypes} from '@ngrx/store';
import * as actions from './example.actions';
import {ExampleState} from './example.state';

/**
 * example initial state
 */
export const exampleInitialState: ExampleState = {};

/**
 * List of basic actions for Example Store
 */
export const exampleReducerFeatures: ReducerTypes<ExampleState, ActionCreator[]>[] = [
  on(actions.setExample, (_state, payload) => ({...payload.model})),

  on(actions.updateExample, (state, payload) => ({...state, ...payload.model})),

  on(actions.resetExample, () => exampleInitialState)
];

/**
 * Example Store reducer
 */
export const exampleReducer = createReducer(
  exampleInitialState,
  ...exampleReducerFeatures
);
`;
