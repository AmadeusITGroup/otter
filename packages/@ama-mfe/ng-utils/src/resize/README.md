# Resize Mechanism

The resize mechanism enables seamless height synchronization between a host application and its embedded iframes. It consists of two parts: a **service** that handles communication between the host and embedded modules, and a **directive** that automatically adjusts iframe dimensions based on content and layout changes.

---

## Resize Message Service

### Introduction
The resize service provides a way for an application embedded via an iframe to forward its own
dimensions to their host, so they can adjust the iframe's dimensions to avoid double scrollbars.

### How to use
Connect both applications to the message service following the [package documentation](../../README.md).

#### Producer
For this scenario, the application embedded within the iframe is the producer of the resize message.

`ResizeProducerService` provides a `startResizeObserver` method that will observe any dimension changes over the
window and post a message to inform the parent window.

```typescript
// main.ts
import {ConnectionService, ResizeService} from '@ama-mfe/ng-utils';
import {inject, runInInjectionContext,} from '@angular/core';
import {bootstrapApplication} from '@angular/platform-browser';
import {App} from './app';
import {appConfig} from './app.config';

bootstrapApplication(App, appConfig)
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

#### Consumer
The host application is the consumer, it will react to the resize message to update the iframe's dimensions.
While you could technically `start` and `stop` in the main module and handle the resize of the iframe yourself, you may
prefer directly using the `scalable` directive exposed by `@ama-mfe/ng-utils` to do it for you.
The directive will handle the `start` and the `stop` of the service, the modification of the iframe's dimensions as well as
the association to the correct iframe in case multiple iframes have been connected on the page.

---

## Scalable Directive - Resize Handling

### Introduction
The `scalable` directive adjusts the `min-height` of an iframe based on resize messages from embedded modules and layout changes. This ensures proper sizing in two common scenarios.

### Usage

```html
<iframe [connect]="moduleId" [scalable]="moduleId" [src]="iframeUrl" height="100%" width="100%"></iframe>
```

The directive handles:
- Starting/stopping the resize consumer service
- Updating iframe dimensions

### Use Cases

#### 1. Fixed Content Height (Body grows with content)

In this scenario, the embedded module's body height changes as content is added or removed.

**Module setup:**
```css
body {
  height: auto; /* or no height set */
}
```

**Behavior:**
- When content grows, the module sends a resize message with the new body height
- The directive sets `min-height` on the iframe to match the content height
- The iframe expands to show all content without scrollbars
- The scrollbar will be in the shell app on the scrollable parent of the iframe

#### 2. Flexible Content Height (Body 100% with overflow)

In this scenario, the embedded module's body has `height: 100%` and `overflow: auto`. The body height stays constant regardless of content changes.

**Module setup:**
```css
body {
  height: 100%;
  overflow: auto;
}
```

**Behavior:**
- The body height is always 100% of the iframe, so content changes don't trigger new resize messages
- Scrolling happens inside the module's body, not on the iframe
- The directive uses `min-height` (not `height`) so the iframe can expand with the container

**Why min-height matters:**
- With `height: 600px` (fixed): iframe is locked at 600px, blank space appears if container is larger
- With `min-height: 600px`: iframe can grow beyond 600px to fill available container space

**Example flow:**
1. Embedded app body height is 600px → channel sends initial `height: 600` → iframe `min-height: 600px`
2. User expands window, container grows to 900px
3. No new channel message (embedded app body is still 100% of the iframe)
4. Iframe has `height: 100%` in CSS, so it expands to 900px (no blank space)
5. At this time the embedded app body will expand too -> message sent -> nothing to do as min-height is already set

### Window Resize Handling

The directive also listens to window resize events to prevent double scrollbars.

**Problem scenario (without resize handling):**
1. Shell container height is 500px
2. Content is 1200px, iframe has `min-height: 1200px` -> scrollbar on shell container
3. User shrinks window to 500px
4. Without updating, iframe keeps `min-height: 1200px` -> scrollbar on iframe too
5. Result: double scroll - container scrolls the iframe, and content scrolls inside iframe

**Solution (with resize handling):**
1. Shell container height is 500px
2. Content is 1200px, iframe has `min-height: 1200px` -> scrollbar on shell container
3. User shrinks window to 500px
4. Window resize triggers → directive updates `min-height` to container height (500px) -> no more scrollbar on shell container
5. Result: single scroll - only inside the iframe

### Technical Details

The directive:
1. Uses `ResizeObserver` to detect container size changes
2. Listens to window `resize` events
3. Finds the nearest scrollable parent (with `overflow: auto` or `overflow: scroll`)
4. Falls back to viewport calculation: `window.innerHeight - element.getBoundingClientRect().top` if no scrollable parent found
5. Caches the last applied height to avoid redundant style updates

