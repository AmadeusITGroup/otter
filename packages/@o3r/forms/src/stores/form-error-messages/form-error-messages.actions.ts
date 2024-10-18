import {
  createAction,
  props
} from '@ngrx/store';
import {
  SetEntitiesActionPayload
} from '@o3r/core';
import {
  FormError
} from '../../core/index';

/** StateDetailsActions */
const ACTION_RESET = '[FormErrorMessages] reset';

/** Entity Actions */
const ACTION_CLEAR_ENTITIES = '[FormErrorMessages] clear entities';
const ACTION_UPSERT_ENTITIES = '[FormErrorMessages] upsert entities';
const ACTION_SET_ENTITIES = '[FormErrorMessages] set entities';
const ACTION_REMOVE_ENTITY = '[FormErrorMessages] remove entities';

/** The payload of remove entity */
export interface RemoveFormErrorMessagesPayload {
  /** id of the FormErrorMessages to be removed */
  id: string;
}

/**
 * Action to remove an entity from the store
 */
export const removeFormErrorMessagesEntity = createAction(ACTION_REMOVE_ENTITY, props<RemoveFormErrorMessagesPayload>());

/**
 * Action to reset the whole state, by returning it to initial state.
 */
export const resetFormErrorMessages = createAction(ACTION_RESET);

/**
 * Clear all formErrorMessages and fill the store with the payload
 */
export const setFormErrorMessagesEntities = createAction(ACTION_SET_ENTITIES, props<SetEntitiesActionPayload<FormError>>());

/**
 * Update formErrorMessages with known IDs, insert the new ones
 */
export const upsertFormErrorMessagesEntities = createAction(ACTION_UPSERT_ENTITIES, props<SetEntitiesActionPayload<FormError>>());

/**
 * Clear only the entities, keeps the other attributes in the state
 */
export const clearFormErrorMessagesEntities = createAction(ACTION_CLEAR_ENTITIES);
