# RequestParameters Service

# Purpose
This service is meant to be used to retain your request / post parameters. It is not a ngrx store. It is an Angular service which set a configured storage values
`_query` and `_post`, reading from

# Configuration

## Storage
By default, sessionStorage. You can provide a custom `Storage`, e.g. `localStorage`.

## Strategy
Strategies available to read / write data in the RequestParameters service and storage.
* Rehydrate: if the storage already have data, those will be used by the service, ignoring new data. Otherwise, set the storage
* Merge: storage data will be merged with the ones provided. (provided data has priority)
* Replace: storage data will be completely replaced by the ones provided
* ReplaceIfNotEmpty: If no parameters are provided, use the content from storage. Otherwise, use the ones provided and update the storage with them.

## Query value (queryParamsValue)
Query parameters value you want to provide to the service

## Post value (postParamsValue)
Post parameters value you want to provide to the service

# How to use
In your application root config, provide your `RequestParameters` configuration.
```typescript
import {provideRequestParameters} from '@o3r/dynamic-content';
...

export const appConfig: ApplicationConfig = {
  providers: [
    // ...
    provideRequestParameters()
  ]
}
```
Using custom configuration, must provide a factory function, returning a `Partial<RequestParametersConfig>`:
```typescript
import {provideRequestParameters, StorageStrategy} from '@o3r/dynamic-content';
...

/** We don't provide directly the value and use a factory because otherwise AOT compilation will resolve to undefined whatever is taken from window */
export function requestParametersConfiguration() {
  return { storage: localStorage, strategy: StorageStrategy.Merge };
}


export const appConfig: ApplicationConfig = {
  providers: [
    // ...
    provideRequestParameters(requestParametersConfiguration)
  ]
};
```
