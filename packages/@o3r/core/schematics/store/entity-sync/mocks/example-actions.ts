export const syncEntityActionsContent = `import {Example} from '@api/sdk';
import {createAction, props} from '@ngrx/store';
import {SetActionPayload, SetEntitiesActionPayload, UpdateActionPayload, UpdateEntitiesActionPayloadWithId} from '@o3r/core';
import {ExampleStateDetails} from './example.state';

/** StateDetailsActions */
const ACTION_SET = '[Example] set';
const ACTION_UPDATE = '[Example] update';
const ACTION_RESET = '[Example] reset';

/** Entity Actions */
const ACTION_CLEAR_ENTITIES = '[Example] clear entities';
const ACTION_UPDATE_ENTITIES = '[Example] update entities';
const ACTION_UPSERT_ENTITIES = '[Example] upsert entities';
const ACTION_SET_ENTITIES = '[Example] set entities';

/**
 * Clear the StateDetails of the store and replace it.
 */
export const setExample = createAction(ACTION_SET, props<SetActionPayload<ExampleStateDetails>>());

/**
 * Change a part or the whole object in the store.
 */
export const updateExample = createAction(ACTION_UPDATE, props<UpdateActionPayload<ExampleStateDetails>>());

/**
 * Action to reset the whole state, by returning it to initial state.
 */
export const resetExample = createAction(ACTION_RESET);

/**
 * Clear all example and fill the store with the payload
 */
export const setExampleEntities  = createAction(ACTION_SET_ENTITIES, props<SetEntitiesActionPayload<Example>>());

/**
 * Update example with known IDs, ignore the new ones
 */
export const updateExampleEntities = createAction(ACTION_UPDATE_ENTITIES, props<UpdateEntitiesActionPayloadWithId<Example>>());

/**
 * Update example with known IDs, insert the new ones
 */
export const upsertExampleEntities = createAction(ACTION_UPSERT_ENTITIES, props<SetEntitiesActionPayload<Example>>());

/**
 * Clear only the entities, keeps the other attributes in the state
 */
export const clearExampleEntities = createAction(ACTION_CLEAR_ENTITIES);

`;
