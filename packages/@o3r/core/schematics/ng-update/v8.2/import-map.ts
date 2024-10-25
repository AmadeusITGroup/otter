/* eslint-disable @typescript-eslint/naming-convention -- names of import changes */
import type {
  ImportsMapping
} from '@o3r/schematics';

/** Map containing the import changes in otter packages for the exported elements */
export const mapImportAsyncStore: ImportsMapping = {
  '@o3r/core': {
    StoreSyncSerializers: {
      newPackage: '@o3r/store-sync'
    },
    isSerializer: {
      newPackage: '@o3r/store-sync'
    },
    StorageSync: {
      newPackage: '@o3r/store-sync'
    },
    StoreSyncConfig: {
      newPackage: '@o3r/store-sync'
    },
    rehydrate: {
      newPackage: '@o3r/store-sync'
    },
    AsyncStorage: {
      newPackage: '@o3r/store-sync'
    },
    AsyncStorageSyncOptions: {
      newPackage: '@o3r/store-sync'
    },
    StorageSyncOptions: {
      newPackage: '@o3r/store-sync'
    },
    isLocalStorageConfig: {
      newPackage: '@o3r/store-sync'
    },
    mergeReducer: {
      newPackage: '@o3r/store-sync'
    },
    localStorageSync: {
      newPackage: '@o3r/store-sync'
    }
  }
};
