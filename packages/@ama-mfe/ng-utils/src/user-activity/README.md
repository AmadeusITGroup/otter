# User Activity Tracking

## Introduction
The User Activity Tracking feature allows a host application (shell) to monitor user interactions across embedded micro-frontends. This is useful for implementing session timeout functionality, analytics, or any feature that needs to know when users are actively interacting with the application.

## How it works

- **Producer**: The `ActivityProducerService` listens for DOM events (click, keydown, scroll, touchstart, focus) and:
  - Exposes a `localActivity` signal for consumers within the same application.
  - Sends throttled activity messages via the communication protocol to connected peers.
- **Consumer**: The `ActivityConsumerService` receives activity messages from connected peers via the communication protocol and exposes them via the `latestReceivedActivity` signal.

Both services can be used in either the shell (host) or embedded applications depending on your use case.

The service automatically throttles messages sent to peers to prevent flooding the communication channel. High-frequency events like `scroll` have additional throttling.

## How to use
Connect both applications to the message service following the [package documentation](../../README.md).

### Producer: send activity signals

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

#### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `throttleMs` | `number` | `1000` | Minimum interval between activity messages sent to the host |
| `trackNestedIframes` | `boolean` | `false` | Enable tracking of nested iframes within the application |
| `nestedIframePollIntervalMs` | `number` | `1000` | Polling interval for detecting iframe focus changes |
| `nestedIframeActivityEmitIntervalMs` | `number` | `30000` | Interval for sending activity signals while an iframe has focus |
| `highFrequencyThrottleMs` | `number` | `300` | Throttle time for high-frequency events (scroll) |
| `shouldBroadcast` | `(event: Event) => boolean` | - | Optional filter function to control which events are broadcast |

#### Filtering Events with shouldBroadcast

The `shouldBroadcast` option allows you to filter which events trigger activity messages:

```typescript
inject(ActivityProducerService).start({
  throttleMs: 1000,
  shouldBroadcast: (event: Event) => {
    // Exclude events on iframes - activity from embedded modules comes via the communication protocol
    return !(event.target instanceof HTMLIFrameElement);
  }
});
```

#### Tracking Nested Iframes

When `trackNestedIframes` is enabled, the service polls `document.activeElement` to detect when an iframe gains focus. While an iframe has focus, the service emits `iframeinteraction` events periodically.

```typescript
inject(ActivityProducerService).start({
  throttleMs: 5000,
  trackNestedIframes: true,
  nestedIframePollIntervalMs: 1000,
  nestedIframeActivityEmitIntervalMs: 30000
});
```

**Tab visibility behavior**: When the user switches to another browser tab while interacting with a nested iframe, the tracking automatically stops emitting `iframeinteraction` events. When the user returns to the tab, the tracking resumes and continues emitting activity events if the iframe still has focus.

### Consumer: receive activity signals

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
    this.activityConsumer.start();

    effect(() => {
      const activity = this.activityConsumer.latestReceivedActivity();
      if (activity) {
        console.log(`Activity from ${activity.channelId}: ${activity.eventType} at ${activity.timestamp}`);
      }
    });
  }

  ngOnDestroy() {
    this.activityConsumer.stop();
  }
}
```

### Local Activity Signal

The `ActivityProducerService` also exposes a `localActivity` signal for detecting activity within the same application:

```typescript
effect(() => {
  const activity = this.activityProducer.localActivity();
  if (activity) {
    // React to local activity (not throttled for local detection)
  }
});
```
