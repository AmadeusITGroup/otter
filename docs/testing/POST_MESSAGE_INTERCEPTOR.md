# PostMessageInterceptor

The ``PostMessageInterceptor`` is a protractor tool to ease the testing of ``window.postMessage`` calls. Its main goal is to gather the data sent and enable the e2e scenarios to create expectations from this data.

## How to set up

The ``PostMessageInterceptor`` first injects a script in the application and then interacts with it to gather data. The scripts preprocess the native ``window.postMessage``, saving the information in memory before really executing the post.

```typescript
import { PostMessageInterceptor, PostMessageCall } from '@o3r/testing/tools/protractor';

const interceptor = new PostMessageInterceptor();

describe('e2e-tests', () => {
  beforeAll(async () => {
    /**
     * Injects the script in the app
     * and intercepts the native window.postMessage
     */
    await interceptor.initialize();
  });

  describe('My page', async () => {
    const conditionFn = (postCall: PostMessageCall): boolean => {
      /**
       * Test if data and/or origin are useful to save up
       * then return the boolean result
       * NOTE: This is mainly because you may have several calls to window.postMessage that you simply don't care (e.g. webpack-dev-server uses the postMessage to tell the app to reload)
      */
    };

    /**
     * Although the interceptor is initialized,
     * it's still not saving (or listening) the intercepted messages
    */
    await interceptor.listen(conditionFn);

    // Navigate to my page of interest
  });

  it('should call postMessage', async () => {
    /**
     * getMessages is called to retrieve the saved postMessages
    */
    const value: PostMessageCall[] = await this.postMessageInterceptor.getMessages();
    expect(value.length).toBe(1);
  });

  afterAll(async () => {
    /**
     * Restore the native window.postMessage
     */
    await interceptor.stop();
  });
});
```

The ``PostMessageCall`` holds the following data:

```typescript
/** A call to postMessage */
export interface PostMessageCall {
  /** Data passed in the message */
  data: any;
  /** Target origin passed in the message */
  targetOrigin: string;
  /** Timestamp of the message */
  timestamp: Date;
}
```

The function passed as an argument to the ``listen`` method is optional, but is highly recommend since it enables to filter out unnecessary messages (e.g. messages from webpack-dev-server).

Also, the ``getMessages`` method polls the internal app memory for new messages. The default poll interval is set to **100 ms**. Also, by default, it retries eternally until it finds a message. To modify those parameters, just call it like this:

```typescript
const pollInterval: number = 250; // 250ms
const retries: number = 5; // 5 tentatives
await this.postMessageInterceptor.getMessages(pollInterval, retries);
```
