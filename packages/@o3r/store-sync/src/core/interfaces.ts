import type { Serializer } from '@o3r/core';
import type { SyncStorageConfig } from '../sync-storage';

/**
 * Format of a key in `StoreSyncConfig`
 */
export interface StoreSyncSerializers {
  [storeName: string]: Serializer<any>;
}

/**
 * An interface defining the configuration attributes to bootstrap `storeSyncMetaReducer`
 */
export interface StoreSyncConfig {
  /** State keys to sync with storage */
  keys: StoreSyncSerializers[];
  /** Pull initial state from storage on startup */
  rehydrate?: boolean;
  /** Specify an object that conforms to the Storage interface to use, this will default to localStorage */
  storage?: Storage;
  /** When set, sync to storage will only occur when this function returns a true boolean */
  syncCondition?: (state: any) => any;
}

/**
 * Typings for async storage
 */
export type AsyncStorage = Omit<Storage, 'getItem'> & {
  getItem(key: string): Promise<string | null>;
};

/**
 * Options for async storage sync
 */
export interface AsyncStorageSyncOptions extends Omit<SyncStorageConfig, 'storage'> {
  storage?: AsyncStorage;
}

/** Options for storage sync */
export type StorageSyncOptions = SyncStorageConfig | AsyncStorageSyncOptions;
