# Navigation Message Service

## Introduction
The navigation service provides a way for an embedded application to share its current routing with its host application.
This allows the host to modify its own `window.location` to match the route of the embedded iframe.

This can be useful to restore the module to the current routing in case the user manually refreshes the tab.

## How to use
Connect both applications to the message service following the [package documentation](../../README.md).

### Producer: share your current navigation
For this scenario, the application embedded within the iframe is the producer of the navigation message.

After calling the `handleEmbeddedRouting` once in your `main.ts`, the `NavigationProducerService` will 
start posting messages whenever the application route is updated:

```typescript
// main.ts
import {inject, runInInjectionContext} from '@angular/core';
import {bootstrapApplication} from '@angular/platform-browser';
import {ConnectionService, RoutingService} from '@ama-mfe/ng-utils';

bootstrapApplication(AppComponent, appConfig)
  .then((m) => {
    runInInjectionContext(m.injector, () => {
      if (window.self !== window.top) {
        void inject(ConnectionService).connect('hostUniqueID');

        // Start the service to produce
        inject(RoutingService).handleEmbeddedRouting();
      }
      // Other injections
    })
  });
```

### Consumer: restore a URL
The host application is the consumer, it will react to the navigation message to modify its location.
This is the default behavior of the `NavigationConsumerService`. Simply call the `start` method to use it
as described in the [package consumer documentation](../../README.md#consumers).

#### Restore the last known URL
The consumer can also memorize the last route of a module if a user wants to resume navigation on the module.
Use the `restoreRoute` and the `memorizeRoute` pipes to compute the iframe URL and provide a `memoryChannelId` to identify 
the module route history.

```html
<iframe [connect]="moduleId"
        memorizeRoute 
        [src]="iframeUrl | restoreRoute:({memoryChannelId: moduleId, propagateQueryParams: true})">
</iframe>
```
`memorizeRoute` will record the navigation history in the iframe.
`restoreRoute` will forward the host query parameters to the iframe and look for the navigation history associated to the
`memoryChannelId`.
