import {
  createAction,
  props,
} from '@ngrx/store';
import {
  Configuration,
} from '@o3r/core';

export interface SetConfigurationEntitiesPayload {
  /** Map of configurations to update/insert, this is now Partial due the change of Configuration interface */
  entities: { [id: string]: Partial<Configuration> };
}

export interface UpsertConfigurationEntityPayload {
  /** ID of the item */
  id: string;
  /** Updated/New configuration object */
  configuration: Partial<Configuration>;
}

export interface UpdateConfigurationEntityPayload {
  /** ID of the item */
  id: string;
  /** Updated/New configuration partial object */
  configuration: Partial<Configuration>;
}

/** Entity Actions */
const ACTION_CLEAR_ENTITIES = '[Configuration] clear entities';
const ACTION_UPDATE_ENTITIES = '[Configuration] update entities';
const ACTION_UPSERT_ENTITIES = '[Configuration] upsert entities';
const ACTION_SET_ENTITIES = '[Configuration] set entities';
const ACTION_UPDATE_CONFIGURATION_ENTITY = '[Configuration] update configuration entity';
const ACTION_UPSERT_CONFIGURATION_ENTITY = '[Configuration] set configuration entity';

/**
 * Upsert one configuration entity
 */
export const upsertConfigurationEntity = createAction(ACTION_UPSERT_CONFIGURATION_ENTITY, props<UpsertConfigurationEntityPayload>());

/**
 * Update one configuration entity
 */
export const updateConfigurationEntity = createAction(ACTION_UPDATE_CONFIGURATION_ENTITY, props<UpdateConfigurationEntityPayload>());

/**
 * Clear all configuration and fill the store with the payload
 */
export const setConfigurationEntities = createAction(ACTION_SET_ENTITIES, props<SetConfigurationEntitiesPayload>());

/**
 * Update configuration with known IDs, ignore the new ones
 */
export const updateConfigurationEntities = createAction(ACTION_UPDATE_ENTITIES, props<SetConfigurationEntitiesPayload>());

/**
 * Update configuration with known IDs, insert the new ones
 */
export const upsertConfigurationEntities = createAction(ACTION_UPSERT_ENTITIES, props<SetConfigurationEntitiesPayload>());

/**
 * Clear only the entities, keeps the other attributes in the state
 */
export const clearConfigurationEntities = createAction(ACTION_CLEAR_ENTITIES);
