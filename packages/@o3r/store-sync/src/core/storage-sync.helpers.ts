import type { Serializer } from '@o3r/core';
import { createAction, props } from '@ngrx/store';
import type { StorageSyncOptions } from './interfaces';
import type { SyncStorageConfig } from '../sync-storage';

/**
 * Defines if an object is a Serializer
 *
 * @param obj Object to test
 * @returns True if the object is a Serializer
 */
export const isSerializer = (obj: any): obj is Serializer<any> => !!(obj.serialize || obj.deserialize || obj.reviver || obj.replacer || obj.initialState);

/**
 * Label of the action to rehydrate the store
 */
export const REHYDRATE_ACTION_LABEL = '[storeSync] rehydrate';

/**
 * Action to rehydrate the store
 */
export const rehydrateAction = createAction(REHYDRATE_ACTION_LABEL, props<{
  payload: Record<string, any>;
}>());

/**
 * Defines if the storage is a non-async storage
 *
 * @param options The storage config
 * @returns in case the storage used is a non-async storage
 */
export const isLocalStorageConfig = (options: StorageSyncOptions): options is SyncStorageConfig => !options.storage || options.storage instanceof Storage;
