import type { Logger } from '@o3r/core';

/**
 * Options to provide to the synchronous store synchronization mechanism
 */
export interface SyncStorageSyncOptions {
  /** Callback to define the serialization strategy of the store */
  serialize?: (state: any) => any;
  /** Callback to define the deserialization strategy of the store */
  deserialize?: (state: any) => any;
  /** Callback to define the reviving strategy of the store */
  reviver?: (key: string, value: any) => any;
  /** replacer callback function provided to the parser */
  replacer?: ((key: string, value: any) => any) | string[];
  /** Filter to apply to the store fields */
  filter?: string[];
  /** Spacing for serializer */
  space?: string | number;
}

/**
 * Interface of the configurations for a store
 */
export interface StorageKeyConfiguration {
  [key: string]: string[] | number[] | StorageKeyConfiguration[] | SyncStorageSyncOptions | ((key: string, value: any) => any);
}

/**
 * Definition of a store to to synchronize
 */
export type StorageKeys = (StorageKeyConfiguration | SyncStorageSyncOptions | string)[];


/**
 * Configuration to define the way the stores should be synchronize to the storage
 */
export interface SyncStorageConfig {
  /** Map of the store to synchronize */
  keys: StorageKeys;
  /** Should the stores be initially rehydrated */
  rehydrate?: boolean;
  /** Storage reference */
  storage?: Storage;
  /** Should be removed from storage if undefined */
  removeOnUndefined?: boolean;
  /** Should apply restore date to the restored stores */
  restoreDates?: boolean;
  /** Callback to define the serialization strategy for the store keys */
  storageKeySerializer?: (key: string) => string;
  /** Callback to defined the condition to the synchronization */
  syncCondition?: (state: any) => any;
  /** check the availability of the storage */
  checkStorageAvailability?: boolean;
  /** Merge reducer to use to deserialize the store */
  mergeReducer?: (state: any, rehydratedState: any, action: any) => any;
  /** Logger to report messages */
  logger?: Logger;
}
