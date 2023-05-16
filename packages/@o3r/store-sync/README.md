# Otter Store Sync

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
