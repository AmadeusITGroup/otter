/*
 * This file is a fork of the package ngrx-store-localstorage (https://github.com/btroncone/ngrx-store-localstorage) - MIT
 * The following update as been added:
 *   - properly export dateReviver function
 *   - add missing comments
 *   - explicit dependency to @ngrx/store for action names
 *   - change interface names to prefix with "sync"
 *   - add logger support
 *   - fix lint according to eslint rules
 *   - split code in several files
 *   - migrate tests to Jest
 */

export * from './interfaces';
export * from './storage-sync';
