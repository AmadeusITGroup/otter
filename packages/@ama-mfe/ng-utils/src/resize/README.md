# Resize Message Service

## Introduction
The resize service provides a way for an application embedded via an iframe to forward its own
dimensions to their host, so they can adjust the iframe's dimensions to avoid multiple scrollbars.

## How to use
Connect both applications to the message service following the [package documentation](../../README.md).

### Producer
For this scenario, the application embedded within the iframe is the producer of the resize message.

`ResizeProducerService` provides a `startResizeObserver` method that will observe any dimension changes over the
window and post a message to inform the parent window.

```typescript
// main.ts
import {ConnectionService, ResizeService} from '@ama-mfe/ng-utils';
import {inject, runInInjectionContext,} from '@angular/core';
import {bootstrapApplication} from '@angular/platform-browser';
import {AppComponent} from './app.component';
import {appConfig} from './app.config';

bootstrapApplication(AppComponent, appConfig)
  .then((m) => {
    runInInjectionContext(m.injector, () => {
      if (window.self !== window.top) {
        void inject(ConnectionService).connect('hostUniqueID');

        // Start the service to produce
        inject(ResizeService).startResizeObserver();
      }
      // Other injections
    })
  });
```

### Consumer
The host application is the consumer, it will react to the resize message to update the iframe's dimensions.
While you could technically `start` and `stop` in the main module and handle the resize of the iframe yourself, you may
prefer directly using the `scalable` directive exposed `@ama-mfe/ng-utils` to do it for you.
The directive will handle the `start` and the `stop` of the service, the modification of the iframe's dimensions as well as
the association to the correct iframe in case multiple iframes have been connected on the page.

```html
<iframe [connect]="moduleId" scalable [src]="iframeUrl" height="100%" width="100%"></iframe>
```
