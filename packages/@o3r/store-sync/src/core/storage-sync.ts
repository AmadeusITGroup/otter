import {
  INIT,
  UPDATE
} from '@ngrx/store';
import equal from 'fast-deep-equal';
import {
  deepFillWithDate
} from '../deep-fill/deep-fill';
import {
  syncStorage
} from '../sync-storage';
import type {
  StorageSyncOptions
} from './interfaces';
import {
  StorageSyncConstructorOptions
} from './interfaces';
import {
  isLocalStorageConfig,
  isSerializer,
  rehydrateAction
} from './storage-sync.helpers';

/**
 * Storage synchronizer
 */
export class StorageSync {
  private readonly alreadyHydratedStoreSlices: Set<string> = new Set();
  private hasHydrated = false;
  private readonly storeImage: { [key: string]: any } = {};

  public options: StorageSyncOptions;

  constructor(options?: StorageSyncConstructorOptions, extraOptions?: { disableSmartSync: boolean }) {
    this.options = {
      keys: [],
      ...(extraOptions?.disableSmartSync
        ? {}
        : {
          syncKeyCondition: (key, state) => !equal(this.storeImage[key], state[key]),
          postProcess: (state) => {
            this.options.keys.forEach((key) => {
              const keyName: string = typeof key === 'object' ? Object.keys(key)[0] : key;
              this.storeImage[keyName] = state[keyName];
            });
          }
        }),
      ...options,
      storage: options?.storage as unknown as Storage,
      mergeReducer: typeof options?.mergeReducer === 'function' ? options.mergeReducer : this.mergeReducer
    };
  }

  /**
   * Handle state manipulation in case of store storage sync
   * Merge strategy is a full merge at init; When a new `store slice` is registered, its initial state is merged with its corresponding storage content
   * Pass it as mergeReducer callback when calling localStorageSync function from 'ngrx-store-localstorage', in the app
   * @param state actual state
   * @param rehydratedState state from storage
   * @param action Triggered action
   */
  public readonly mergeReducer = (state: any, rehydratedState: any, action: any) => {
    if (rehydratedState) {
      if (action.type === INIT) {
        state = deepFillWithDate(state, rehydratedState);
      }
      if (action.type === UPDATE && Array.isArray(action.features)) {
        const notHandledFeatures = action.features.filter((featName: string) => !this.alreadyHydratedStoreSlices.has(featName));

        notHandledFeatures.filter((featName: string) => !!rehydratedState[featName]).forEach((fName: string) => {
          state[fName] = state[fName] ? deepFillWithDate(state[fName], rehydratedState[fName]) : rehydratedState[fName];
          this.alreadyHydratedStoreSlices.add(fName);
        });
      }
    }
    return state;
  };

  /**
   * Returns a meta reducer that handles storage sync
   */
  public localStorageSync = () => {
    const base = (reducer: any) => syncStorage({
      ...this.options,
      rehydrate: false,
      storage: this.options.storage as unknown as Storage,
      syncCondition: () => this.hasHydrated
    })(reducer);

    return (reducer: any) => {
      if (isLocalStorageConfig(this.options)) {
        return syncStorage(this.options)(reducer);
      }

      return (state: any, action: any) => {
        let hydratedState = state;
        if (action.type === rehydrateAction.type) {
          const hasAlreadyHydrated = this.hasHydrated;
          this.hasHydrated = true;
          const initialStates = this.options.keys.reduce((acc: Record<string, any>, key) => {
            const storeName = Object.keys(key)[0];
            const storeSynchronizer = (key as any)[storeName];
            if (isSerializer(storeSynchronizer)) {
              acc[storeName] = storeSynchronizer.initialState;
            }
            return acc;
          }, {});
          let overrides = {};
          if (!hasAlreadyHydrated) {
            overrides = Object.entries(action.payload).reduce<Record<string, any>>((acc, [storeName, value]) => {
              if (!initialStates[storeName] || initialStates[storeName] === state[storeName]) {
                acc[storeName] = value;
              } else if (initialStates[storeName] !== state[storeName]) {
                (this.options.logger || console).error(`Unable to rehydrate store "${storeName}", it has been modified before being hydrated`);
              }
              return acc;
            }, {});
          }
          if (Object.keys(overrides).length > 0) {
            hydratedState = { ...state, ...overrides };
          }
        }
        return base(reducer)(hydratedState, action);
      };
    };
  };
}
