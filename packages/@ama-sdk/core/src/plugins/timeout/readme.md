# Timeout
Plugin to raise an exception on a fetch request timeout.
The timeout can be configured to stop and restart from the beginning depending on events.

## Timeout pause/restart mechanism
You can configure an ``TimeoutPauseEventHandler`` to stop the timeout from throwing errors upon some events.

One of these example is the Captcha. If your user is currently resolving a captcha, the request might not go through
until the captcha is fully resolved. This is not something you actually want.

### Imperva Captcha event 
Today the @ama-sdk/core plugin exposes the ``impervaCaptchaEventHandlerFactory`` that will emit event if a captcha has 
been displayed on your website. It is only compatible with Imperva UI events and can be used as follows:

```typescript
import {impervaCaptchaEventHandlerFactory, TimeoutFetch} from './timeout.fetch';

const fetchPlugin = new TimeoutFetch(60000, impervaCaptchaEventHandlerFactory({whiteListedHostNames: ['myCaptchaDomain']}));
```

Only events posted from the white listed domain will be listened to, make sure to correctly configure the factory,

### Custom event
You can create your own ``TimeoutPauseEventHandler`` that will call the timeoutPauseCallback whenever you need to pause
or restart the timeout.

```typescript
import {TimeoutPauseEventHandlerFactory, TimeoutStatus} from '@ama-sdk/core';

export const myTimeoutPauseEventHandlerFactory: TimeoutPauseEventHandlerFactory<MyConfigInterface> = (config) =>
  (timeoutPauseCallback: (timeoutStatus: TimeoutStatus) => void) => {
    const onCustomEvent = ((event: MyCustomEvent<any>) => {
      let pauseStatus: TimeoutStatus;
      // some extra logic to define the status based on your event
      timeoutPauseCallback(pauseStatus);
    });
    addEventListener(MyCustomEvent, onCustomEvent);
    return () => {
      removeEventListener(MyCustomEvent, onCustomEvent);
    };
  };
```

## Type of plugins

- Fetch plugin: [TimeoutFetch](./timeout.fetch.ts)
