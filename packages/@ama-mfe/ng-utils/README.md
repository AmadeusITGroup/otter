# Ama MFE Angular Utils
`@ama-mfe/ng-utils` is an Angular library designed to streamline communication within a micro-frontend architecture that
uses iframes.
This package is built on the [Amadeus Toolkit for Micro Frontends framework](https://www.npmjs.com/package/@amadeus-it-group/microfrontends-angular)
and offers a suite of tools - including helpers, wrappers, and services - to facilitate seamless integration and
interaction between host and embedded applications.

Key features include:
- [Connect](https://github.com/AmadeusITGroup/otter/blob/main/packages/%40ama-mfe/ng-utils/src/connect/): Connect to the communication protocol and send messages to registered applications.
- [Navigation](https://github.com/AmadeusITGroup/otter/blob/main/packages/%40ama-mfe/ng-utils/src/navigation/): Handles navigation messages between the host and embedded applications. Embedded applications can use `RoutingService` to sync their internal routing with the host application. The host application can use `NavigationConsumerService` to get notifications about navigation events in the embedded applications.
- [Theme](https://github.com/AmadeusITGroup/otter/blob/main/packages/%40ama-mfe/ng-utils/src/theme/): Allows the application of unified CSS variables and styles across embedded modules, ensuring a cohesive
look and feel.
- [Resize](https://github.com/AmadeusITGroup/otter/blob/main/packages/%40ama-mfe/ng-utils/src/resize/): Dynamically adjusts the iframe dimensions to fit the content of the embedded application, enhancing the
user experience.

## Installation
To install the package, run:

```bash
npm exec ng add @ama-mfe/ng-utils
```

## Consumer and Producer
In the communication protocol, a message is created by a `Producer` and sent to a `Consumer` which will read the message
and react according to its content.

The `@ama-mfe/ng-utils` package exposes a set of features based on messages exchanged between a host application and its
embedded module. For each feature, the package provides a `Producer`/`Consumer` pair.
The former service is in charge of delivering the messages based on triggers (resize event, call to a public function
etc.) while the latter implements the logic behind the feature (resizing of the iframe, application of a theme, etc.).

## How to use
### Connection to the communication service
#### Configure your application connection
Applications first need to provide and configure the `ConnectionService` to use the communication protocol.
The `provideConnection` method allows an application to register with a unique ID that others will use to
connect and target the application.

```typescript
import {provideConnection} from '@ama-mfe/ng-utils';

export const appConfig: ApplicationConfig = {
  providers: [
    provideConnection({
      id: 'applicationUniqueID'
    })
  ]
};
```

#### Initiate the communication with the host application
An application embedded into another one can connect to its host using the [ConnectionService].
To establish the connection, the embedded application requires the host application id (set via the
[connection service's provider](#configure-your-application-connection)).

```typescript
// main.ts
import {inject, runInInjectionContext} from '@angular/core';
import {bootstrapApplication} from '@angular/platform-browser';
import {ConnectionService, NavigationConsumerService} from '@ama-mfe/ng-utils';

bootstrapApplication(App, appConfig)
  .then((m) => {
    runInInjectionContext(m.injector, () => {
      if (window.top !== window.self) {
        // If embedded in an iframe, connect to the host
        inject(ConnectionService).connect('hostUniqueID');
      }
      // Other injections
    })
  });
```

#### Initiate the connection to your embedded module
Use the `connect` directive to initiate the communication between your application and the module in the iframe.
The communication pipe will be closed once the iframe is destroyed.

```html
<iframe [src]='myModuleUrl'
        [connect]='myModuleUniqueID'>
</iframe>
```
In this example, `myModuleUniqueID` refers to the id provided in the `provideConnection` method.

### Enable a message-based feature
To use a feature based on the message communication protocol, you need first to identify if your application will be a
user of the message (`Consumer`) or the one sending the message (`Producer`).
This may depend on the context and the type of message. For instance, an application can be the consumer of navigation
messages but the producer of theme messages.

#### Consumers
If you are a consumer of the message, call the `start` and `stop` methods to respectively enable and disable the feature.

```typescript
import {Component, inject} from '@angular/core';
import {NavigationConsumerService} from '@ama-mfe/ng-utils';
import {ThemeConsumerService} from "./theme-consumer-service";

@Component({
  selector: 'app-example-module-component',
  template: './example-module-component.html',
  styleUrl: './example-module-component.scss',
})
export class ExampleModuleComponent {
  private readonly navigationConsumerService = inject(NavigationConsumerService);

  constructor() {
    this.navigationConsumerService.start();
  }

  ngOnDestroy() {
    this.navigationConsumerService.stop()
  }
}
```

Depending on your use case, you might need to start the service as soon as your application start running.
In this case, you may inject it in the `main.ts`:

```typescript
// main.ts
import {inject, runInInjectionContext} from '@angular/core';
import {bootstrapApplication} from '@angular/platform-browser';
import {ConnectionService, ThemeConsumerService} from '@ama-mfe/ng-utils';

bootstrapApplication(App, appConfig)
  .then((m) => {
    runInInjectionContext(m.injector, () => {
      if (window.top !== window.self) {
        // If embedded in an iframe, connect to the host
        inject(ConnectionService).connect('hostUniqueID');
        // Start the service to consume messages
        inject(ThemeConsumerService).start();
      }
      // Other injections
    })
  });
```

#### Producers
If your application is a producer, just inject the message producer service and call the trigger when needed.
There is no standardization on the name of the methods used to trigger a message. It will be different for each service.

#### Services provided in @ama-mfe/ng-utils
You will find more information for each service in their respective `README.md`:
- [Navigation](https://github.com/AmadeusITGroup/otter/tree/main/packages/%40ama-mfe/ng-utils/src/navigation/README.md)
- [Resize](https://github.com/AmadeusITGroup/otter/tree/main/packages/%40ama-mfe/ng-utils/src/resize/README.md)
- [Theme](https://github.com/AmadeusITGroup/otter/tree/main/packages/%40ama-mfe/ng-utils/src/theme/README.md)

### Write your own producer and consumers.
Use the `ProducerManagerService` and the `ConsumerManagerService` to support your own custom messages.

A message should be identified by its type and a version to allow different message versions between the host and the
embedded applications (and avoid migration issues).

```typescript
import type {Message} from '@amadeus-it-group/microfrontends';

export interface CustomMessageV1_0 extends Message {
  type: 'custom',
  version: '1.0',
  // Custom properties
  customPayload: any
}
// Use union type here to add all the future version
// For example CustomMessage = CustomMessageV1_0 | CustomMessagev2_0
export type CustomMessageVersions = CustomMessageV1_0;
```

#### Consumer
A consumer should implement the `MessageConsumer` interface and inject the `ConsumeManagerService` which handles the
registration to the communication protocol.
It should list the supported versions and map its callback function in a `supportedVersions` public object.

```typescript
import type {CustomMessageV1_0, CustomMessageVersions} from '@ama-mfe/messages';
import type {RoutedMessage} from '@amadeus-it-group/microfrontends';
import {DestroyRef, inject, Injectable} from '@angular/core';
import {ConsumerManagerService, type MessageConsumer} from '@ama-mfe/ng-utils';

@Injectable({
  providedIn: 'root'
})
export class CustomConsumerService implements MessageConsumer<CustomMessageVersions> {
  /**
   * The type of messages this service handles ('custom').
   */
  public readonly type = 'custom';

  /**
   * The supported versions of theme messages and their handlers.
   */
  public readonly supportedVersions = {
    '1.0': (message: RoutedMessage<CustomMessageV1_0>) => console.log('Do some stuff with this message version', message)
  };

  private readonly consumerManagerService = inject(ConsumerManagerService);

  constructor() {
    this.start();
    inject(DestroyRef).onDestroy(() => this.stop());
  }

  /**
   * Starts the theme handler service by registering it into the consumer manager service.
   */
  public start() {
    this.consumerManagerService.register(this);
  }

  /**
   * Stops the theme handler service by unregistering it from the consumer manager service.
   */
  public stop() {
    this.consumerManagerService.unregister(this);
  }
}
```

#### Producer
A producer should implement the `MessageProducer` interface and inject the `ProducerManagerService` which handles the
registration to the communication protocol.
Once connected, it is able to send messages via the `MessagePeerService`.

```typescript
import type {CustomMessageV1_0, CustomMessageVersions} from '../messages';
import {MessagePeerService} from '@amadeus-it-group/microfrontends-angular';
import {inject, Injectable} from '@angular/core';
import {type MessageProducer, type ErrorContent, registerProducer} from '@ama-mfe/ng-utils';

@Injectable({
  providedIn: 'root'
})
export class CustomService implements MessageProducer<CustomMessageVersions> {
  private readonly messageService = inject(MessagePeerService<CustomMessageVersions>);

  constructor() {
    registerProducer(this);
  }

  public handleError(message: ErrorContent<CustomMessage_V1_0>): void {
    // If available, use your own logger
    console.error('Error in custom service message', message);
  }

  public postMessageAction(payload: any): void {
    const messageV10 = {
        type: 'custom',
        version: '1.0',
        customPayload: 'test'
      } satisfies CustomMessageV1_0;
    this.messageService.send(messageV10);
  }
}
```
### Host information

#### Host application

A host application can send information to the embedded applications using parameters in the URL.

```html
<iframe [src]="'myModuleUrl' | hostInfo: {hostId: 'host-app-id', moduleId: 'my-module-to-embed'}"></iframe>
```

This will add the `location.origin` and the application id of the host to the URL of the embedded application.

#### Embedded application

The embedded application can access the data sent in the previous section using an injection token:

```typescript
import {inject} from '@angular/core';
import {getHostInfo, isEmbedded} from '@ama-mfe/ng-utils';

export class SomeClass {
  private readonly hostInfo = getHostInfo();

  doSomething() {
    if (this.hostInfo.applicationId === 'app1') {
      // Do something when embedded in app1
    } else if (isEmbedded()) {
      // Do something when embedded elsewhere
    } else {
      // Do something when standalone
    }
  }
}
```

The host information is stored in session storage so it won't be lost when navigating inside the iframe.

### Browser history handling

When using iframes to embed applications, the browser history might be shared by the main page and the embedded iframe. For example `<iframe src="https://example.com" sandbox="allow-same-origin">` will share the same history as the main page. This can lead to unexpected behavior when using browser 'back' and 'forward' buttons.

To avoid this, the `@ama-mfe/ng-utils` will forbid the application running in the iframe to alter the browser history. It will happen when connection is configured using `provideConection()` function. This will prevent the iframe to be able to use the `history.pushState` and `history.replaceState` methods.

### User Activity Tracking

The User Activity Tracking feature allows a host application (shell) to monitor user interactions across embedded micro-frontends. This is useful for implementing session timeout functionality, analytics, or any feature that needs to know when users are actively interacting with the application.

#### How it works

- **Producer**: The `ActivityProducerService` listens for DOM events (click, keydown, scroll, touchstart, focus) and:
  - Exposes a `localActivity` signal for consumers within the same application (not throttled for local detection).
  - Sends throttled activity messages via the communication protocol to connected peers.
- **Consumer**: The `ActivityConsumerService` receives activity messages from connected peers via the communication protocol and exposes them via the `latestReceivedActivity` signal.

Both services can be used in either the shell (host) or embedded applications depending on your use case. For example:
- A shell can produce activity signals to notify embedded modules of user interactions in the host.
- An embedded module can consume activity signals from the shell.
- An application can use the producer's `localActivity` signal to detect activity locally.

The service automatically throttles messages sent to peers to prevent flooding the communication channel. High-frequency events like `scroll` have additional throttling.

#### Producer Configuration

Start the `ActivityProducerService` to send activity signals to connected peers:

```typescript
import { inject, runInInjectionContext } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { ConnectionService, ActivityProducerService } from '@ama-mfe/ng-utils';

bootstrapApplication(App, appConfig)
  .then((m) => {
    runInInjectionContext(m.injector, () => {
      if (window.top !== window.self) {
        inject(ConnectionService).connect('hostUniqueID');
        // Start activity tracking with custom throttle
        inject(ActivityProducerService).start({
          throttleMs: 5000 // Send at most one message every 5 seconds
        });
      }
    });
  });
```

##### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `throttleMs` | `number` | `1000` | Minimum interval between activity messages sent to the host |
| `trackNestedIframes` | `boolean` | `false` | Enable tracking of nested iframes within the application |
| `nestedIframePollIntervalMs` | `number` | `1000` | Polling interval for detecting iframe focus changes |
| `nestedIframeActivityEmitIntervalMs` | `number` | `30000` | Interval for sending activity signals while an iframe has focus |
| `highFrequencyThrottleMs` | `number` | `300` | Throttle time for high-frequency events (scroll) |
| `shouldBroadcast` | `(event: Event) => boolean` | - | Optional filter function to control which events are broadcast |

##### Filtering Events with shouldBroadcast

The `shouldBroadcast` option allows you to filter which events trigger activity messages. This is useful in the shell application to exclude events that occur on iframes, since user activity inside embedded modules is already tracked via the communication protocol.

```typescript
// In the shell application
inject(ActivityProducerService).start({
  throttleMs: 1000,
  shouldBroadcast: (event: Event) => {
    // Exclude events on iframes - activity from embedded modules comes via the communication protocol
    return !(event.target instanceof HTMLIFrameElement);
  }
});
```

##### Tracking Nested Iframes

When a user interacts with content inside an iframe (e.g., a third-party widget, payment form, or embedded content), the parent application cannot detect those interactions directly. This is because:

1. **Cross-origin restrictions**: DOM events inside cross-origin iframes do not bubble up to the parent document.
2. **Focus isolation**: When an iframe has focus, the parent document stops receiving keyboard and mouse events.

This creates a problem for detection of user interactions: a user could be actively filling out a form inside an iframe, but the host application would see no activity and might incorrectly trigger a session timeout.

**Solution**: When `trackNestedIframes` is enabled, the `ActivityProducerService` polls `document.activeElement` to detect when an iframe gains focus. While an iframe has focus, the service simulates activity by periodically emitting `iframeinteraction` events. This ensures the host application knows the user is still active, even though it cannot see the actual interactions inside the iframe.

Enable nested iframe tracking in embedded applications that contain other iframes:

```typescript
inject(ActivityProducerService).start({
  throttleMs: 5000,
  trackNestedIframes: true,
  nestedIframePollIntervalMs: 1000, // Check for iframe focus every second
  nestedIframeActivityEmitIntervalMs: 30000 // Send activity every 30s while iframe has focus
});
```

**When to use**: Enable this option in embedded modules that contain iframes whose content you cannot modify to include activity tracking (e.g., third-party widgets, payment providers, or external content).

#### Consumer Configuration

Start the `ActivityConsumerService` to receive activity signals from connected peers:

```typescript
import { Component, inject, effect } from '@angular/core';
import { ActivityConsumerService } from '@ama-mfe/ng-utils';

@Component({
  selector: 'app-shell',
  template: '...'
})
export class ShellComponent {
  private readonly activityConsumer = inject(ActivityConsumerService);

  constructor() {
    // Start listening for activity messages
    this.activityConsumer.start();

    // React to activity changes
    effect(() => {
      const activity = this.activityConsumer.latestReceivedActivity();
      if (activity) {
        console.log(`Activity from ${activity.channelId}: ${activity.eventType} at ${activity.timestamp}`);
        // Reset session timeout, update analytics, etc.
      }
    });
  }

  ngOnDestroy() {
    this.activityConsumer.stop();
  }
}
```

#### Local Activity Signal

The `ActivityProducerService` also exposes a `localActivity` signal for detecting activity within the same application:

```typescript
import { Component, inject, effect } from '@angular/core';
import { ActivityProducerService } from '@ama-mfe/ng-utils';

@Component({
  selector: 'app-root',
  template: '...'
})
export class AppComponent {
  private readonly activityProducer = inject(ActivityProducerService);

  constructor() {
    this.activityProducer.start({ throttleMs: 1000 });

    effect(() => {
      const activity = this.activityProducer.localActivity();
      if (activity) {
        // React to local activity (not throttled for local detection)
      }
    });
  }
}
```
