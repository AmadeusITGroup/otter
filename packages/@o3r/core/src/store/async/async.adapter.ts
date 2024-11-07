import {
  AsyncStoreItem,
  EntityStatus,
} from './async.interfaces';

/**
 * Adapter to help manipulate AsyncStoreItems to register new request and update the status when they fail or resolve.
 */
export interface AsyncStoreItemAdapter {
  /**
   * Adds a request to an AsyncStoreItem.
   * If the item had a failure and no ongoing requests, sets it's failure status back to false
   * @param item
   * @param requestId
   */
  addRequest<T extends AsyncStoreItem>(item: T, requestId: string): T;

  /**
   * Updates an AsyncStoreItem when a request has resolved.
   * Removes it from its requestIds array.
   * If no requestId provided, the method returns the current status of the AsyncStoreItem
   * @param item
   * @param requestId
   */
  resolveRequest<T extends AsyncStoreItem>(item: T, requestId?: string): T;

  /**
   * Updates an AsyncStoreItem when a request has failed.
   * Removes it from its requestIds array and set its failure status.
   * @param item
   * @param requestId
   */
  failRequest<T extends AsyncStoreItem>(item: T, requestId?: string): T;

  /**
   * Add AsyncStoreItem properties (with initial values) to the given entity
   * @param entityItem
   * @returns Given item improved with AsyncStoreItem properties
   */
  initialize<T extends object>(entityItem: T): T & AsyncStoreItem;

  /**
   * Extract only AsyncStoreItem properties from the given entity
   * @param entityItem   A model containing AsyncStoreItem properties
   * @returns Object containing only AsyncStoreItem properties
   */
  extractAsyncStoreItem<T extends AsyncStoreItem>(entityItem: T): AsyncStoreItem;

  /**
   * Clear AsyncStoreItem properties from the given entity
   * @param entityItem A model containing AsyncStoreItem properties
   */
  clearAsyncStoreItem<T extends AsyncStoreItem>(entityItem: T): T;

  /**
   * Merges an AsyncStoreItem collection into one item that gives an overall status.
   * @param items
   */
  merge(...items: (AsyncStoreItem | undefined)[]): AsyncStoreItem;

  /**
   * Add a request to the given subResource of an EntityStatus object
   * @param status
   * @param subResource
   * @param requestId
   */
  entityStatusAddRequest<T extends EntityStatus<T>>(status: T, subResource: keyof T, requestId: string): T;

  /**
   * Resolve a request on the given subResource of an EntityStatus object
   * @param status
   * @param subResource
   * @param requestId
   */
  entityStatusResolveRequest<T extends EntityStatus<T>>(status: T, subResource: keyof T, requestId?: string): T;

  /**
   * Fail a request to the given subResource of an EntityStatus object
   * @param status
   * @param subResource
   * @param requestId
   */
  entityStatusFailRequest<T extends EntityStatus<T>>(status: T, subResource: keyof T, requestId?: string): T;

  /**
   * Reset the failure status of the given subResource of an EntityStatus object
   * @param status
   * @param subResource
   */
  entityStatusResetFailure<T extends EntityStatus<T>>(status: T, subResource: keyof T): T;

  /**
   * Reset the failure status of the given AsyncStoreItem to false
   * @param entityItem
   * @returns AsyncStoreItem with the updated failure status
   */
  resetFailureStatus<T extends AsyncStoreItem>(entityItem: T): T;

  /**
   * Set the pending status of the given AsyncStoreItem to true
   * @param entityItem
   * @returns AsyncStoreItem with the updated pending status
   */
  setLoadingStatus<T extends AsyncStoreItem>(entityItem: T): T;
}

export const asyncStoreItemAdapter: AsyncStoreItemAdapter = {
  addRequest: (item, requestId) => {
    return {
      ...item,
      requestIds: [...item.requestIds, requestId],
      isFailure: item.requestIds.length === 0 ? false : item.isFailure,
      isPending: true
    };
  },

  failRequest: (item, requestId) => {
    const requestIds = requestId ? item.requestIds.filter((id) => id !== requestId) : item.requestIds;
    return {
      ...item,
      isFailure: true,
      isPending: requestIds.length > 0,
      requestIds
    };
  },

  resolveRequest: (item, requestId) => {
    const requestIds = requestId ? item.requestIds.filter((id) => id !== requestId) : item.requestIds;
    return {
      ...item,
      requestIds,
      isPending: requestIds.length > 0
    };
  },

  initialize: (entityItem) => {
    return {
      ...entityItem,
      requestIds: []
    };
  },

  extractAsyncStoreItem: (entityItem) => {
    return {
      requestIds: [...entityItem.requestIds],
      isFailure: entityItem.isFailure,
      isPending: entityItem.isPending
    };
  },

  clearAsyncStoreItem: <T extends AsyncStoreItem>(entityItem: T) => {
    const { isPending, isFailure, ...newResponse }: T = { ...entityItem, requestIds: [] };
    return newResponse as T;
  },

  merge: (...items) => {
    return items.reduce<AsyncStoreItem>((mergedItem, item) => item
      ? {
        requestIds: [...mergedItem.requestIds, ...item.requestIds],
        isFailure: mergedItem.isFailure || item.isFailure,
        isPending: mergedItem.isPending || item.isPending
      }
      : mergedItem, asyncStoreItemAdapter.initialize({}));
  },

  entityStatusAddRequest: (status, subResource, requestId) => {
    const currentSubStatus: AsyncStoreItem = status[subResource] || asyncStoreItemAdapter.initialize({});
    return {
      ...status,
      [subResource]: asyncStoreItemAdapter.addRequest(currentSubStatus, requestId)
    };
  },

  entityStatusResolveRequest: (status, subResource, requestId) => {
    const currentSubStatus = status[subResource];
    return {
      ...status,
      [subResource]: currentSubStatus ? asyncStoreItemAdapter.resolveRequest(currentSubStatus, requestId) : { requestIds: [] }
    };
  },

  entityStatusFailRequest: (status, subResource, requestId) => {
    const currentSubStatus = status[subResource];
    return {
      ...status,
      [subResource]: currentSubStatus ? asyncStoreItemAdapter.failRequest(currentSubStatus, requestId) : { requestIds: [], isFailure: true }
    };
  },

  entityStatusResetFailure: (status, subResource) => {
    const currentSubStatus = status[subResource];
    return {
      ...status,
      [subResource]: currentSubStatus ? asyncStoreItemAdapter.resetFailureStatus(currentSubStatus) : { requestIds: [] }
    };
  },

  resetFailureStatus: (entityItem) => {
    return {
      ...entityItem,
      isFailure: false
    };
  },

  setLoadingStatus: (entityItem) => {
    return {
      ...entityItem,
      isPending: true
    };
  }
};
