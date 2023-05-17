import { INIT, UPDATE } from '@ngrx/store';
import { deepFill } from '@o3r/core';
import type { StorageSyncOptions } from './interfaces';
import { isLocalStorageConfig, isSerializer, rehydrateAction } from './storage-sync.helpers';
import { syncStorage } from '../sync-storage';

/**
 * Storage synchronizer
 */
export class StorageSync {
  private alreadyHydratedStoreSlices: Set<string> = new Set();
  private hasHydrated = false;

  public options: StorageSyncOptions;

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
   */
  public localStorageSync() {
    return (reducer: any) => {
      if (isLocalStorageConfig(this.options)) {
        return syncStorage(this.options)(reducer);
      }

      const base = syncStorage({
        ...this.options,
        rehydrate: false,
        storage: this.options.storage as unknown as Storage,
        syncCondition: () => this.hasHydrated
      })(reducer);

      return (state: any, action: any) => {
        let hydratedState = state;
        if (action.type === rehydrateAction.type) {
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
