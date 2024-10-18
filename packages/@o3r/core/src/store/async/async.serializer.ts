import type {
  EntityState
} from '@ngrx/entity';
import {
  asyncStoreItemAdapter
} from './async.adapter';
import {
  AsyncStoreItem,
  EntityStatus
} from './async.interfaces';

/**
 * Serializer for asynchronous store.
 * @param state State of an asynchronous store to serialize
 * @returns a plain json object to pass to json.stringify
 */
export function asyncSerializer<T extends AsyncStoreItem>(state: T) {
  return asyncStoreItemAdapter.clearAsyncStoreItem(state);
}

/**
 * Serializer for asynchronous entity store.
 * @param state State of an asynchronous entity store to serialize
 * @returns a plain json object to pass to json.stringify
 */
export function asyncEntitySerializer<T extends AsyncStoreItem & EntityState<AsyncStoreItem>>(state: T) {
  const entities = (state.ids as string[]).reduce((entitiesAcc, entityId) => {
    entitiesAcc[entityId] = asyncStoreItemAdapter.clearAsyncStoreItem(state.entities[entityId]!);
    return entitiesAcc;
  }, {} as typeof state.entities);

  return { ...asyncStoreItemAdapter.clearAsyncStoreItem(state), entities };
}

/**
 * Serializer for asynchronous entity store with status.
 * @param state State of an asynchronous entity store with status to serialize
 * @returns a plain json object to pass to json.stringify
 */
export function asyncEntityWithStatusSerializer<T extends AsyncStoreItem & EntityState<AsyncStoreItem & { status: EntityStatus<T['entities']['status']> }>>(state: T) {
  const entities = (state.ids as string[]).reduce((entitiesAcc, entityId) => {
    entitiesAcc[entityId] = { ...asyncStoreItemAdapter.clearAsyncStoreItem(state.entities[entityId]!), status: {} };
    return entitiesAcc;
  }, {} as typeof state.entities);

  return { ...asyncStoreItemAdapter.clearAsyncStoreItem(state), entities };
}
