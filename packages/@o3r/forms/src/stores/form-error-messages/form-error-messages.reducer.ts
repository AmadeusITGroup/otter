import {
  createEntityAdapter,
  EntityAdapter,
} from '@ngrx/entity';
import {
  ActionCreator,
  createReducer,
  on,
  ReducerTypes,
} from '@ngrx/store';
import * as actions from './form-error-messages.actions';
import {
  FormErrorMessagesState,
  FormErrorModel,
} from './form-error-messages.state';

/**
 * FormErrorMessages Store adapter
 */
export const formErrorMessagesAdapter: EntityAdapter<FormErrorModel> = createEntityAdapter<FormErrorModel>({
  selectId: (model) => model.formId
});

/**
 * FormErrorMessages Store initial value
 */
export const formErrorMessagesInitialState: FormErrorMessagesState = formErrorMessagesAdapter.getInitialState({});

/**
 *  List of basic actions for FormErrorMessages Store
 */
export const formErrorMessagesReducerFeatures: ReducerTypes<FormErrorMessagesState, ActionCreator[]>[] = [
  on(actions.resetFormErrorMessages, () => formErrorMessagesInitialState),

  on(actions.setFormErrorMessagesEntities, (state, payload) => formErrorMessagesAdapter.addMany(payload.entities, formErrorMessagesAdapter.removeAll(state))),

  on(actions.upsertFormErrorMessagesEntities, (state, payload) => formErrorMessagesAdapter.upsertMany(payload.entities, state)),

  on(actions.clearFormErrorMessagesEntities, (state) => formErrorMessagesAdapter.removeAll(state)),

  on(actions.removeFormErrorMessagesEntity, (state, payload) => formErrorMessagesAdapter.removeOne(payload.id, state))
];

/**
 * FormErrorMessages Store reducer
 */
export const formErrorMessagesReducer = createReducer(
  formErrorMessagesInitialState,
  ...formErrorMessagesReducerFeatures
);
