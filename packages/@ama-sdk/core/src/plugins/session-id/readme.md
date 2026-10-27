## Session ID

Plugin to add a header with an ID that can be used to track all the calls made by one or several APIs of the SDK.

This ID is composed of both a session part and a request part resulting in a unique ID for a single request.
It is formatted as `SESSION_ID:REQUEST_ID` where:

- **SESSION_ID** is an UUID identifying the client-side user session
- **REQUEST_ID** is a unique token within a session matching the [a-zA-Z0-9]{1,10} format

The **REQUEST_ID** can be deactivated. In this case the ID is formatted as **SESSION_ID** only.

### Usage

```typescript
import { SessionIdRequest } from '@ama-sdk/core';

// Generated session ID (retrieved from memory / session storage when it already exists)
const plugin = new SessionIdRequest();

// Customize the plugin through its options
const pluginWithOptions = new SessionIdRequest({ sessionIdHeader: 'Ama-Client-Ref', activateRequestId: true });
```

The positional constructor `new SessionIdRequest(sessionIdHeader, activateRequestId)` is deprecated and will be removed in v16. Pass a `SessionIdRequestOptions` object instead.

### Supplied session ID

A session ID can be supplied to the plugin, for instance to reuse an identifier owned by the application:

```typescript
const plugin = new SessionIdRequest({ sessionId: appSessionId });
// Ama-Client-Ref: <appSessionId>:<REQUEST_ID>
```

The supplied session ID:

- takes priority over any session ID already stored (shared memory or session storage) for the header,
- is stored for the header, so other `SessionIdRequest` instances using the same header without a supplied session ID reuse it,
- resets the **REQUEST_ID** counter when it differs from the previously stored session ID.

An empty string is ignored and the session ID is retrieved or generated as usual.

### Type of plugins

- Request plugin: [SessionIdRequest](./session-id-request.ts)
