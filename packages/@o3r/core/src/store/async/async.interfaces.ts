import {
  FailActionPayload, FailEntitiesActionPayload,
  SetActionPayload, SetEntitiesActionPayload, SetEntityActionPayload,
  UpdateEntitiesActionPayload,
  UpdateEntitiesActionPayloadWithId,
  UpdateEntityActionPayload, UpdateEntityActionPayloadWithId
} from '../types';

export type RequestId = string;

/**
 * Interface representing an asynchronous request
 */
export interface AsyncRequest {
  /** ID of the request */
  requestId: RequestId;
}

/**
 * Represents a store item that can be manipulated via asynchronous calls
 */
export interface AsyncStoreItem {
  /**
   * IDs of the active asynchronous requests for this item.
   */
  requestIds: RequestId[];

  /**
   * Has a recent call failed.
   * This is reset back to false the next time a new async process is started and there are no active requests.
   */
  isFailure?: boolean;

  /**
   * Is an asynchronous process ongoing on that item
   */
  isPending?: boolean;
}

/**
 * Payload for actions relying on asynchronous requests
 */
export interface FromApiActionPayload<T> extends Partial<AsyncRequest> {
  /** Promise call from API */
  call: Promise<T>;
}

/**
 * Unwraps the type of a FromApiActionPayload
 */
export type ExtractFromApiActionPayloadType<T extends FromApiActionPayload<any>> = T['call'] extends Promise<infer U> ? U : never;


/**
 * Payload for actions relying on asynchronous requests
 */
export interface FromApiActionPayloadWithEntityId<T> extends FromApiActionPayload<T> {
  /** ID of the entity affected by the call */
  id?: string;
}

/** Add an optional request ID to the given object */
export type WithRequestId<T> = T & Partial<AsyncRequest>;

/** Payload to set entities actions from async */
export interface SetAsyncStoreItemActionPayload<T> extends SetActionPayload<T>, Partial<AsyncRequest> {}

/** Payload to update entities actions from async */
// eslint-disable-next-line @typescript-eslint/ban-types
export interface UpdateAsyncStoreItemEntitiesActionPayload<T extends object, K extends keyof T> extends UpdateEntitiesActionPayload<T, K>, Partial<AsyncRequest> {}

/** Payload to update entities actions from async with a field ID */
export interface UpdateAsyncStoreItemEntitiesActionPayloadWithId<T extends {id: string}> extends UpdateEntitiesActionPayloadWithId<T>, Partial<AsyncRequest> {}

/** Payload to update entity actions from async */
// eslint-disable-next-line @typescript-eslint/ban-types
export interface UpdateAsyncStoreItemEntityActionPayload<T extends object, K extends keyof T> extends UpdateEntityActionPayload<T, K>, Partial<AsyncRequest> {}

/** Payload to update entity actions from async with a field ID */
export interface UpdateAsyncStoreItemEntityActionPayloadWithId<T extends {id: string}> extends UpdateEntityActionPayloadWithId<T>, Partial<AsyncRequest> {}

/** Payload to set/upsert entities actions from async */
// eslint-disable-next-line @typescript-eslint/ban-types
export interface SetAsyncStoreItemEntitiesActionPayload<T extends object> extends SetEntitiesActionPayload<T>, Partial<AsyncRequest> {}

/** Payload to set/upsert entity actions from async */
// eslint-disable-next-line @typescript-eslint/ban-types
export interface SetAsyncStoreItemEntityActionPayload<T extends object> extends SetEntityActionPayload<T>, Partial<AsyncRequest> {}

/** Payload to fail entity actions from async */
// TODO Check
// eslint-disable-next-line @typescript-eslint/ban-types
export interface FailAsyncStoreItemEntityActionPayload<T extends object> extends FailActionPayload<T>, Partial<AsyncRequest> {}

/** Payload to fail entities actions from async */
// eslint-disable-next-line @typescript-eslint/ban-types
export interface FailAsyncStoreItemEntitiesActionPayload<T extends object> extends FailEntitiesActionPayload<T>, Partial<AsyncRequest> {}

/** Status for all the elements inside a cart */
export type EntityStatus<T, U extends keyof T = never> = {
  [P in keyof Omit<T, 'id' | U>]?: AsyncStoreItem
};

/**
 * Extends an Entity model with a status property that holds async information for each of its sub-resources
 */
export type EntityWithStatus<T> = T & { status: EntityStatus<T> };

/** Modifies the given type that extends AsyncStoreItem to remove those properties */
export type EntityWithoutAsyncStoreItem<T extends AsyncStoreItem> = Omit<T, keyof AsyncStoreItem>;
