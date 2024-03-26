import type {EntityAdapter, EntityState, Update} from '@ngrx/entity';
import {asyncStoreItemAdapter} from './async.adapter';
import {AsyncStoreItem, EntityWithoutAsyncStoreItem} from './async.interfaces';

/** Adapter for Asynchronous Entity Store */
export interface EntityAsyncRequestAdapter<T extends AsyncStoreItem> extends EntityAdapter<T> {

  /**
   * Updates the AsyncStoreItem properties of each entity matching an id from the list of given ids, when a request has failed.
   * @param state        Actual state
   * @param ids          Ids of the entity to be updated with AsyncStoreItem properties
   * @param requestId    Id of request which has failed
   */
  failRequestMany<V extends EntityState<T> & AsyncStoreItem>(state: V, ids?: string[], requestId?: string): V;

  /**
   * Adds AsyncStoreItem property to the global store, or the entity if it already exists, when a request is triggered.
   * @param state       Actual state
   * @param id          Id of the entity to update
   * @param requestId   Id of the request which is triggered
   */
  addRequestOne<V extends EntityState<T> & AsyncStoreItem>(state: V, id: string | null | undefined, requestId: string): V;

  /**
   * Adds AsyncStoreItem properties for each entity matching the given ids, when a request is triggered
   * @param state        Actual state
   * @param ids          Ids of the entity to be updated with AsyncStoreItem properties
   * @param requestId    Id of request which is triggered
   */
  addRequestMany<V extends EntityState<T>>(state: V, ids: string[], requestId: string): V;

  /**
   * Updates the state with the given entity. Update the global or the current entity's status if it exists.
   * @param state        Actual state
   * @param entity       Payload item;
   * @param requestId    Id of request which has resolved if any
   */
  resolveRequestOne<V extends EntityState<T> & AsyncStoreItem>(state: V, entity: EntityWithoutAsyncStoreItem<T> & Record<'id', string>, requestId?: string): V;

  /**
   * Updates the state with the given entity. Update the global or the current entity's status if it exists.
   * @param state        Actual state
   * @param entity       Payload item;
   * @param requestId    Id of request which has resolved if any
   * @param idProperty   Property of the entity containing its unique identifier
   */
  resolveRequestOne<V extends EntityState<T> & AsyncStoreItem, W extends keyof T>(state: V, entity: EntityWithoutAsyncStoreItem<T> & Record<W, string>, requestId?: string, idProperty?: W): V;

  /**
   * Updates the state with the given entities. Updates also AsyncStoreItem properties of each entity, when a request is resolved.
   * @param state        Actual state
   * @param entities     Payload items;
   * @param requestId    Id of request which has resolved if any
   */
  resolveRequestMany<V extends EntityState<T>>(state: V, entities: (Partial<T> & Record<'id', string>)[], requestId?: string): V;

  /**
   * Updates the state with the given entities. Updates also AsyncStoreItem properties of each entity, when a request is resolved.
   * @param state        Actual state
   * @param entities     Payload items;
   * @param requestId    Id of request which has resolved if any
   * @param idProperty   Property of the entity containing its unique identifier
   */
  resolveRequestMany<V extends EntityState<T>, W extends keyof T>(state: V, entities: (Partial<T> & Record<W, string>)[], requestId?: string, idProperty?: W): V;
}

/**
 * Create an Asynchronous Request Entity Adapter
 * @param  adapter  Entity Adapter
 */
export function createEntityAsyncRequestAdapter<T extends AsyncStoreItem>(adapter: EntityAdapter<T>): EntityAsyncRequestAdapter<T> {

  const addRequestOne: <V extends EntityState<T> & AsyncStoreItem>(state: V, id: string | null | undefined, requestId: string) => V = (state, id, requestId) => {
    const currentEntity = typeof id !== 'undefined' && id !== null && state.entities[id];
    if (currentEntity) {
      const changes = asyncStoreItemAdapter.addRequest(asyncStoreItemAdapter.extractAsyncStoreItem(currentEntity), requestId);
      return adapter.updateOne({id, changes} as Update<T>, state);
    }
    return asyncStoreItemAdapter.addRequest(state, requestId);
  };

  const addRequestMany: <V extends EntityState<T>>(state: V, ids: string[], requestId: string) => V =
    <V extends EntityState<T>>(state: V, ids: string[], requestId: string): V =>
      adapter.updateMany(ids.filter((id) => !!state.entities[id]).map((id) => ({
        id,
        changes: asyncStoreItemAdapter.addRequest(asyncStoreItemAdapter.extractAsyncStoreItem(state.entities[id]!), requestId)
      } as Update<T>)
      ), state);

  const resolveRequestOne: <V extends EntityState<T> & AsyncStoreItem, W extends keyof T | 'id' = 'id'>
  (state: V, entity: EntityWithoutAsyncStoreItem<T> & Record<W, string>, requestId?: string, idProperty?: W) => V =
    <V extends EntityState<T> & AsyncStoreItem, W extends keyof T | 'id'>(state: V, entity: EntityWithoutAsyncStoreItem<T> & Record<W, string>, requestId?: string, idProperty: W = 'id' as W): V => {
      let newEntity;
      const currentEntity = state.entities[entity[idProperty]];
      if (currentEntity) {
        newEntity = asyncStoreItemAdapter.resolveRequest({...entity, ...asyncStoreItemAdapter.extractAsyncStoreItem(currentEntity)}, requestId);
      } else {
        newEntity = asyncStoreItemAdapter.initialize(entity);
        state = asyncStoreItemAdapter.resolveRequest(state, requestId);
      }
      return adapter.upsertOne(newEntity as T, state);
    };

  const resolveRequestMany: <V extends EntityState<T>, W extends keyof T | 'id' = 'id'>(state: V, entities: (Partial<T> & Record<W, string>)[], requestId?: string, idProperty?: W) => V =
    <V extends EntityState<T>, W extends keyof T | 'id'>(state: V, entities: (Partial<T> & Record<W, string>)[], requestId?: string, idProperty: W = 'id' as W): V =>
      adapter.updateMany(entities.filter((entity) => !!state.entities[entity[idProperty]]).map((entity) => {
        const model = {...entity, ...asyncStoreItemAdapter.extractAsyncStoreItem(state.entities[entity[idProperty]]!)};
        return {id: entity[idProperty], changes: asyncStoreItemAdapter.resolveRequest(model, requestId)};
      }
      ), state);

  const failRequestMany: <V extends EntityState<T> & AsyncStoreItem>(state: V, ids?: string[], requestId?: string) => V =
    <V extends EntityState<T> & AsyncStoreItem>(state: V, ids: string[] = [], requestId?: string): V => {
      if (ids.length && !ids.some((id) => state.entities[id] === undefined)) {
        return adapter.updateMany(ids.map((id) => ({
          id,
          changes: asyncStoreItemAdapter.failRequest(asyncStoreItemAdapter.extractAsyncStoreItem(state.entities[id]!), requestId)
        } as Update<T>)
        ), state);
      }
      return asyncStoreItemAdapter.failRequest(state, requestId);
    };

  return {
    ...adapter,
    failRequestMany,
    addRequestOne,
    addRequestMany,
    resolveRequestOne,
    resolveRequestMany
  };
}
