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

bootstrapApplication(AppComponent, appConfig)
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
import {ThemeConsumerService} from "./theme.consumer.service";

@Component({
  selector: 'app-example-module',
  template: './example-module.template.html',
  styleUrl: './example-module.style.scss',
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

bootstrapApplication(AppComponent, appConfig)
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
