import { INIT, UPDATE } from '@ngrx/store';
import { deepFill } from '@o3r/core';
import type { Logger } from '@o3r/core';
import type { StorageKeyConfiguration, StorageKeys, SyncStorageConfig, SyncStorageSyncOptions } from './interfaces';

/**
 * Reviver the date from a JSON field if the string is matching iso format. Return the same value otherwise
 *
 * @param _key JSON item key name
 * @param value JSON item value
 */
export const dateReviver = (_key: string, value: any) => {
  if (typeof value === 'string' && /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(value)) {
    return new Date(value);
  }
  return value;
};

/**
 * Dummy reviver returning the value of the field as it is
 *
 * @param _key JSON item key name
 * @param value JSON item value
 */
const dummyReviver = (_key: string, value: any) => value;

/**
 * Determine if the code is run in a browser
 */
const checkIsBrowserEnv = () => {
  return typeof window !== 'undefined';
};

/**
 * Validate the keys structure of the registered stores
 *
 * @param keys map of store to synchronize
 */
const validateStateKeys = (keys: StorageKeys) => {
  return (keys as any[]).map((key) => {
    let attr = key;

    if (typeof key === 'object') {
      attr = Object.keys(key)[0];
    }

    if (typeof attr !== 'string') {
      throw new TypeError(
        'localStorageSync Unknown Parameter Type: ' + `Expected type of string, got ${typeof attr}`
      );
    }
    return key;
  });
};

/**
 * Rehydrate the state of the whole application store
 *
 * @param keys Keys of the store to rehydrate
 * @param storage storage when getting the data from
 * @param storageKeySerializer storage key transform function
 * @param restoreDates determine if the date need to be restored
 * @param logger
 */
export const rehydrateApplicationState = (
  keys: StorageKeys,
  storage: Storage | undefined,
  storageKeySerializer: (key: string) => string,
  restoreDates: boolean,
  logger: Logger = console
) => {
  return (keys as any[]).reduce((acc, curr) => {
    let key = curr;
    let reviver = restoreDates ? dateReviver : dummyReviver;
    let deserialize: ((arg0: string) => any) | undefined;
    let decrypt: ((arg0: string) => string) | undefined;

    if (typeof key === 'object') {
      key = Object.keys(key)[0];
      // use the custom reviver function
      if (typeof curr[key] === 'function') {
        reviver = curr[key];
      } else {
        // use custom reviver function if available
        if (curr[key].reviver) {
          reviver = curr[key].reviver;
        }
        // use custom serialize function if available
        if (curr[key].deserialize) {
          deserialize = curr[key].deserialize;
        }
      }

      // Ensure that encrypt and decrypt functions are both present
      if (curr[key].encrypt && curr[key].decrypt) {
        if (typeof curr[key].encrypt === 'function' && typeof curr[key].decrypt === 'function') {
          decrypt = curr[key].decrypt;
        } else {
          logger.error(`Either encrypt or decrypt is not a function on '${curr[key] as string}' key object.`);
        }
      } else if (curr[key].encrypt || curr[key].decrypt) {
        // Let know that one of the encryption functions is not provided
        logger.error(`Either encrypt or decrypt function is not present on '${curr[key] as string}' key object.`);
      }
    }
    if (storage !== undefined) {
      let stateSlice = storage.getItem(storageKeySerializer(key));
      if (stateSlice) {
        // Use provided decrypt function
        if (decrypt) {
          stateSlice = decrypt(stateSlice);
        }

        const isObjectRegex = new RegExp('{|\\[');
        let raw = stateSlice;

        if (stateSlice === 'null' || stateSlice === 'true' || stateSlice === 'false' || isObjectRegex.test(stateSlice.charAt(0))) {
          raw = JSON.parse(stateSlice, reviver);
        }

        return Object.assign({}, acc, {
          [key]: deserialize ? deserialize(raw) : raw
        });
      }
    }
    return acc;
  }, {});
};

// Recursively traverse all properties of the existing slice as defined by the `filter` argument,
// and output the new object with extraneous properties removed.
function createStateSlice(existingSlice: any, filter: (string | number | StorageKeyConfiguration | SyncStorageSyncOptions)[]) {
  return filter.reduce(
    (memo: { [x: string]: any;[x: number]: any }, attr: string | number | StorageKeyConfiguration | SyncStorageSyncOptions) => {
      if (typeof attr === 'string' || typeof attr === 'number') {
        const value = existingSlice?.[attr];
        if (value !== undefined) {
          memo[attr] = value;
        }
      } else {
        for (const key in attr) {
          if (Object.prototype.hasOwnProperty.call(attr, key)) {
            const element = attr[key];
            memo[key] = createStateSlice(existingSlice[key], element);
          }
        }
      }
      return memo;
    },
    {}
  );
}

/**
 * Update the state of the store after reviving from storage
 * Note: this function is mainly use for internal process of store synchronization
 *
 * @param state store state
 * @param keys key of the store
 * @param storage storage to use for the synchronization
 * @param storageKeySerializer callback to serialize the store key
 * @param removeOnUndefined Define if the store should be clean in the storage if undefined
 * @param syncCondition callback to define if the synchronization should be process
 * @param logger Logger to report messages
 */
export const syncStateUpdate = (
  state: any,
  keys: StorageKeys,
  storage: Storage | undefined,
  storageKeySerializer: (key: string | number) => string,
  removeOnUndefined = false,
  syncCondition?: (state: any) => any,
  logger: Logger = console
) => {
  if (syncCondition) {
    try {
      if (syncCondition(state) !== true) {
        return;
      }
    } catch (e) {
      // Treat TypeError as do not sync
      if (e instanceof TypeError) {
        return;
      }
      throw e;
    }
  }

  keys.forEach((key: string | StorageKeyConfiguration | SyncStorageSyncOptions | ((key: string, value: any) => any)): void => {
    let stateSlice = state[key as string];
    let replacer;
    let space: string | number | undefined;
    let encrypt;

    if (typeof key === 'object') {
      const name = Object.keys(key)[0];
      stateSlice = state[name];

      if (typeof stateSlice !== 'undefined' && key[name]) {
        // use serialize function if specified.
        if (key[name].serialize) {
          stateSlice = key[name].serialize(stateSlice);
        } else {
          // if serialize function is not specified filter on fields if an array has been provided.
          let filter: StorageKeyConfiguration[] | undefined;
          if (key[name].reduce) {
            filter = key[name];
          } else if (key[name].filter) {
            filter = key[name].filter;
          }
          if (filter) {
            stateSlice = createStateSlice(stateSlice, filter);
          }

          // Check if encrypt and decrypt are present, also checked at this#rehydrateApplicationState()
          if (key[name].encrypt && key[name].decrypt) {
            if (typeof key[name].encrypt === 'function') {
              encrypt = key[name].encrypt;
            }
          } else if (key[name].encrypt || key[name].decrypt) {
            // If one of those is not present, then let know that one is missing
            logger.error(
              `Either encrypt or decrypt function is not present on '${key[name] as string}' key object.`
            );
          }
        }

        /*
          Replacer and space arguments to pass to JSON.stringify.
          If these fields don't exist, undefined will be passed.
        */
        replacer = key[name].replacer;
        space = key[name].space;
      }

      key = name;
    }

    if (typeof stateSlice !== 'undefined' && storage !== undefined) {
      try {
        if (encrypt) {
          // ensure that a string message is passed
          stateSlice = encrypt(
            typeof stateSlice === 'string' ? stateSlice : JSON.stringify(stateSlice, replacer, space)
          );
        }
        storage.setItem(
          storageKeySerializer(key as string),
          typeof stateSlice === 'string' ? stateSlice : JSON.stringify(stateSlice, replacer, space)
        );
      } catch (e) {
        console.warn('Unable to save state to localStorage:', e);
      }
    } else if (typeof stateSlice === 'undefined' && removeOnUndefined && storage !== undefined) {
      try {
        storage.removeItem(storageKeySerializer(key as string));
      } catch (e) {
        console.warn(`Exception on removing/cleaning undefined '${key as string}' state`, e);
      }
    }
  });
};

const defaultMergeReducer = (state: any, rehydratedState: any, action: any) => {
  if ((action.type === INIT || action.type === UPDATE) && rehydratedState) {
    state = deepFill(state, rehydratedState);
  }

  return state;
};

/**
 * Local and Session storage synchronization helper
 *
 * @param config
 */
export const syncStorage = (config: SyncStorageConfig) => (reducer: any) => {
  if (
    (config.storage === undefined && !config.checkStorageAvailability) ||
    (config.checkStorageAvailability && checkIsBrowserEnv())
  ) {
    config.storage = localStorage || window.localStorage;
  }

  if (config.storageKeySerializer === undefined) {
    config.storageKeySerializer = (key) => key;
  }

  if (config.restoreDates === undefined) {
    config.restoreDates = true;
  }

  // Use default merge reducer.
  let mergeReducer = config.mergeReducer;

  if (mergeReducer === undefined || typeof mergeReducer !== 'function') {
    mergeReducer = defaultMergeReducer;
  }

  const logger = config.logger || console;

  const stateKeys = validateStateKeys(config.keys);
  const rehydratedState = config.rehydrate
    ? rehydrateApplicationState(stateKeys, config.storage, config.storageKeySerializer, config.restoreDates, logger)
    : undefined;

  return (state: any, action: any) => {
    let nextState: any;

    // If state arrives undefined, we need to let it through the supplied reducer
    // in order to get a complete state as defined by user
    if (action.type === INIT && !state) {
      nextState = reducer(state, action);
    } else {
      nextState = { ...state };
    }

    // Merge the store state with the rehydrated state using
    // either a user-defined reducer or the default.
    nextState = mergeReducer!(nextState, rehydratedState, action);

    nextState = reducer(nextState, action);

    if (action.type !== INIT) {
      syncStateUpdate(
        nextState,
        stateKeys,
        config.storage,
        config.storageKeySerializer as (key: string | number) => string,
        config.removeOnUndefined,
        config.syncCondition,
        logger
      );
    }

    return nextState;
  };
};
