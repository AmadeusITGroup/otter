# Otter Store Sync

This module exposes an NgRx store synchronization solution (synchronous and asynchronous) via the class `StorageSync`.

To facilitate the synchronization, the `StorageSync` class is based on a fork of [ngrx-store-localstorage](https://github.com/btroncone/ngrx-store-localstorage), an exposed package used to sync an NgRx store and the local or session storage.
Compared to the original version of the fork, the **@o3r/store-sync** module includes changes that improve overall synchronization performance.

These changes include:

- Support of a `smartSync` setup to improve performance
- Support of asynchronous synchronization

There are also code-specific changes:

- Addition of logger support
- Proper export of the `dateReviver` function
- Explicit dependency on `@ngrx/store` for the action names (`INIT` and `UPDATE`)
- Change of interface names with prefixes
- Removal of deprecated `deepmerge` dependency
- Addition of missing comments and descriptions
- Lint fix according to ESLint rules
- Split of code into several files
- Migration of tests to Jest

## Usage

The **@o3r/store-sync** module is useful if you plan to use the `metaReducers` configuration in the `StoreModule` (more information [here](https://ngrx.io/guide/store/metareducers)).
To use the module, import its `StorageSync` class in the `AppModule` and create a variable as an instance of that class. 
There are optional [configuration options](https://github.com/AmadeusITGroup/otter/blob/main/packages/%40o3r/store-sync/src/core/interfaces.ts)
that can be passed to the [constructor](https://github.com/AmadeusITGroup/otter/blob/main/packages/%40o3r/store-sync/src/core/storage-sync.ts)
of the class.

Then, wrap `localStorageSync` in an exported function and include it in your meta-reducers array in `StoreModule.forRoot`. You can read more about
`localStorageSync` in the [ngrx-store-localstorage documentation](https://github.com/btroncone/ngrx-store-localstorage/blob/master/README.md). 
You can also use the previously declared `StorageSync` variable to configure the meta-reducer returned by the `localStorageSync` in the wrapper function.

For example:

```typescript
import { StorageSync } from '@o3r/store-sync';
import { Keys, localStorageSync } from 'ngrx-store-localstorage';

const storageSync = new StorageSync();

/**
 * @param reducer
 */
export function localStorageSyncWrapper<T, V extends Action = Action>(reducer: ActionReducer<T, V>): ActionReducer<T, V> {
  // Store configuration
  const localStoragedStates: Keys = [{exampleStoreName: exampleStoreNameStorageSync}];
  return localStorageSync({mergeReducer: storageSync.mergeReducer, keys: localStoragedStates})(reducer);
}

const metaReducers = [...(environment.ENABLE_WEBSTORAGE ? [localStorageSyncWrapper] : [])];

@NgModule({
  // ...
  imports: [
    //...
    StoreModule.forRoot(rootReducers, { metaReducers })
  ]
})
export class AppModule {}
```

## Configuration

### Smart sync

The original `ngrx-store-localstorage` synchronizes all of your states every time a state is updated, which can lead to a large number
of accesses to both local and session storage and cause performance issues.

To avoid this pitfall, by default **@o3r/store-sync** synchronizes a state only if its value changed and no longer matches that of
the storage.
This behavior can be disabled as follows:

```typescript
const storageSync = new StorageSync({keys: [...myStorekeys]}, {disableSmartSync: true});
```

### Asynchronous synchronization

As described above, we also support asynchronous synchronization thanks to the **@o3r/store-sync** module. To give some context, the Storage interface
contains a `getItem` function which *"returns the current value associated with the given key, or null if the given key does not exist"*. In our
asynchronous storage interface, we have overridden the return type of this function to handle promises (the return type is `Promise<string | null>`).

This override impacts the `storage` configuration option when setting up the `StorageSync` class in the application.

Also, when using asynchronous synchronization, the `localStorageSync` from **@o3r/store-sync** should be used (instead of **ngrx-store-localstorage** as shown in the example above).

### Merge reducer

The configuration contains an optional property `mergeReducer`, which defines the reducer to use to deserialize the store. As mentioned above in
the code-specific changes, we implemented an explicit dependency on `@ngrx/store` for the action names (`INIT` and `UPDATE`), which is not the case
for the original `ngrx-store-localstorage` due to a module resolution issue.

Hence, if you use the `metaReducers` configuration in the `StoreModule`, we recommend using our override of the `mergeReducer` when setting up the `StorageSync` in your application
(as shown in the usage example above).
