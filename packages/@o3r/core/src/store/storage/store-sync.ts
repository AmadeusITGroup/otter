import { createAction, INIT, props, UPDATE } from '@ngrx/store';
import { LocalStorageConfig, localStorageSync as ngrxLocalStorageSync } from 'ngrx-store-localstorage';
import { deepFill } from '../../utils';
import { Serializer } from '../types';

/**
 * Format of a key in `StoreSyncConfig`
 *
 * @deprecated will be removed in v10, use the one exported by @o3r/store-sync instead
 */
export interface StoreSyncSerializers {
  [storeName: string]: Serializer<any>;
}

/**
 * Defines if an object is a Serializer
 *
 * @deprecated will be removed in v10, use the one exported by @o3r/store-sync instead
 * @param obj Object to test
 * @returns True if the object is a Serializer
 */
export const isSerializer = (obj: any): obj is Serializer<any> => !!(obj.serialize || obj.deserialize || obj.reviver || obj.replacer || obj.initialState);

/**
 * An interface defining the configuration attributes to bootstrap `storeSyncMetaReducer`
 *
 * @deprecated will be removed in v10, use the one exported by @o3r/store-sync instead
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
 * Action to rehydrate the store
 *
 * @deprecated will be removed in v10, use the `rehydrateAction` exported by @o3r/store-sync instead
 */
export const rehydrate = createAction('[CapacitorRehydrater] rehydrate', props<{
  payload: Record<string, any>;
}>());

/**
 * Typings for async storage
 *
 * @deprecated will be removed in v10, use the one exported by @o3r/store-sync instead
 */
export type AsyncStorage = Omit<Storage, 'getItem'> & {
  getItem(key: string): Promise<string | null>;
};

/**
 * Options for async storage sync
 *
 * @deprecated will be removed in v10, use the one exported by @o3r/store-sync instead
 */
export interface AsyncStorageSyncOptions extends Omit<LocalStorageConfig, 'storage'> {
  storage?: AsyncStorage;
}

interface Logger {
  /**
   * Log an error.
   *
   * @deprecated will be removed in v10, use the one exported by @o3r/store-sync instead
   * @param message Message to log
   * @param optionalParams Optional parameters to log
   */
  error(message?: any, ...optionalParams: any[]): void;
}

/**
 * Options for storage sync
 *
 * @deprecated will be removed in v10, use the one exported by @o3r/store-sync instead
 */
export type StorageSyncOptions = (LocalStorageConfig | AsyncStorageSyncOptions) & {
  /**
   * Optional logger to use for logging errors
   */
  logger?: Logger;
};

/**
 * Defines if the storage is a non-async storage
 *
 * @deprecated will be removed in v10, use the one exported by @o3r/store-sync instead
 * @param options The storage config
 * @returns in case the storage used is a non-async storage
 */
export const isLocalStorageConfig = (options: StorageSyncOptions): options is LocalStorageConfig => !options.storage || options.storage instanceof Storage;

export class StorageSync {
  private alreadyHydratedStoreSlices: Set<string> = new Set();
  public options: StorageSyncOptions;
  private hasHydrated = false;

  constructor(options?: Partial<StorageSyncOptions>) {
    this.options = {
      keys: [],
      ...options,
      mergeReducer: typeof options?.mergeReducer !== 'function' ? this.mergeReducer : options.mergeReducer
    };
  }

  /**
   * Handle state manipulation in case of store storage sync
   * Merge strategy is a full merge at init; When a new `store slice` is registered, its initial state is merged with its corresponding storage content
   * Pass it as mergeReducer callback when calling localStorageSync function from 'ngrx-store-localstorage', in the app
   *
   * @deprecated will be removed in v10, use the one exported by @o3r/store-sync instead
   * @param state actual state
   * @param rehydratedState state from storage
   * @param action Triggered action
   */
  public readonly mergeReducer = (state: any, rehydratedState: any, action: any) => {
    if (rehydratedState) {
      if (action.type === INIT) {
        state = deepFill(state, rehydratedState);
      }
      if (action.type === UPDATE && Array.isArray(action.features)) {

        const notHandledFeatures = action.features.filter((featName: string) => !this.alreadyHydratedStoreSlices.has(featName));

        notHandledFeatures.filter((featName: string) => !!rehydratedState[featName]).forEach((fName: string) => {
          state[fName] = state[fName] ? deepFill(state[fName], rehydratedState[fName]) : rehydratedState[fName];
          this.alreadyHydratedStoreSlices.add(fName);
        });

      }
    }
    return state;
  };

  /**
   * Returns a meta reducer that handles storage sync
   *
   * @deprecated will be removed in v10, use the one exported by @o3r/store-sync instead
   */
  public localStorageSync() {
    return (reducer: any) => {
      if (isLocalStorageConfig(this.options)) {
        return ngrxLocalStorageSync(this.options)(reducer);
      }
      const base = ngrxLocalStorageSync({
        ...this.options,
        rehydrate: false,
        storage: this.options.storage as unknown as Storage,
        syncCondition: () => this.hasHydrated
      })(reducer);
      return (state: any, action: any) => {
        let hydratedState = state;
        if (action.type === rehydrate.type) {
          const hasAlreadyHydrated = this.hasHydrated;
          this.hasHydrated = true;
          const initialStates = this.options.keys.reduce((acc: Record<string, any>, key) => {
            const storeName = Object.keys(key)[0];
            const storeSynchronizer = key[storeName];
            if (isSerializer(storeSynchronizer)) {
              acc[storeName] = storeSynchronizer.initialState;
            }
            return acc;
          }, {});
          let overrides = {};
          if (!hasAlreadyHydrated) {
            overrides = Object.entries(action.payload).reduce((acc, [storeName, value]) => {
              if (!initialStates[storeName] || initialStates[storeName] === state[storeName]) {
                acc[storeName] = value;
              } else if (initialStates[storeName] !== state[storeName]) {
                (this.options.logger || console).error(`Unable to rehydrate store "${storeName}", it has been modified before being hydrated`);
              }
              return acc;
            }, {});
          }
          if (Object.keys(overrides).length) {
            hydratedState = { ...state, ...overrides };
          }
        }
        return base(hydratedState, action);
      };
    };
  }
}
