<h1 align="center">Otter Store Sync</h1>
<p align="center">
  <img src="../../../assets/logo/otter.png" alt="Super cute Otter!" width="40%"/>
</p>

This package is an [Otter Framework Module](https://github.com/AmadeusITGroup/otter/tree/main/docs/core/MODULE.md).
<br />
<br />

## Description

This module is exposing an NgRx store synchronization solution (synchronous and asynchronous) via the class `StorageSync`.

To facilitate the synchronization, the `StorageSync` class is based on a fork of [ngrx-store-localstorage](https://github.com/btroncone/ngrx-store-localstorage) that is also exposed and includes the following changes on top of the original version:

- Export properly the `dateReviver` function
- Add missing comments
- Explicit dependency to `@ngrx/store` for the action names
- Change interface names to prefix with "sync"
- Add logger support
- Fix lint according to ESLint rules
- Split code in several files
- Migrate tests to Jest
- Removal of deprecated `deepmerge` dependency.
- Support of a `smartSync` setup to improve performances 

### Configuration
#### Smart sync
The original ngrx-store-localstorage synchronize all of your states everytime a state is updated which can lead to a lot 
of accesses to the local and session storage and cause performance issue.

To avoid this pitfall, by default the @o3r/store-sync only synchronizes a state if its value changed and no longer matches
the storage. 
This behaviour can be disabled as follows:
```typescript
const storage = new StorageSync({keys: [...myStorekeys]}, {disableSmartSync: true});
```
