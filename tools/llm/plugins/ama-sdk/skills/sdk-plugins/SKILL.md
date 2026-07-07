---
name: sdk-plugins
description: Use and create @ama-sdk plugins for request transformation, authentication, resilience, and response processing. Use when user asks about SDK plugins, wants to add auth/retry/timeout, needs to create a custom plugin, or wants to transform requests before sending, wrap the fetch call itself (logging, metrics, circuit-breaking), or process/transform responses.
---

# SDK Plugins

Configure built-in plugins and create custom ones for @ama-sdk clients.

## Plugin Architecture

Plugins are registered on client instantiation and execute in order:

```typescript
const client = new ApiFetchClient({
  basePath: 'https://api.example.com',
  requestPlugins: [/* transform request before sending */],
  fetchPlugins: [/* wrap the fetch call itself */],
  replyPlugins: [/* process the response */]
});
```

**Execution order:**
1. `requestPlugins` transform the `RequestOptions` (headers, query params, body)
2. `fetchPlugins` wrap the actual HTTP call (retry, timeout, abort)
3. `replyPlugins` process the response (deserialization, error handling)

> **Important:** When customizing `replyPlugins`, always re-apply the `ExceptionReply` and `ReviverReply` plugins. These are included by default but will be lost if you override the array. Without them, the SDK cannot deserialize responses or throw typed exceptions properly.

## Built-in Plugins

For the full up-to-date list of available plugins, browse the source directories:

- **Request plugins** (imported from `@ama-sdk/core`): https://github.com/AmadeusITGroup/otter/tree/main/packages/@ama-sdk/core/src/plugins
- **Fetch plugins** (imported from `@ama-sdk/client-fetch`): https://github.com/AmadeusITGroup/otter/tree/main/packages/@ama-sdk/client-fetch/src/plugins

## Common Configurations

### Authentication with API Key

```typescript
import { ApiKeyRequest } from '@ama-sdk/core';
import { ApiFetchClient } from '@ama-sdk/client-fetch';

const client = new ApiFetchClient({
  basePath: 'https://api.example.com',
  requestPlugins: [
    new ApiKeyRequest('Bearer my-token', 'Authorization')
  ]
});
```

### Dynamic token (async)

```typescript
import { ApiKeyRequest } from '@ama-sdk/core';

const client = new ApiFetchClient({
  basePath: 'https://api.example.com',
  requestPlugins: [
    new ApiKeyRequest(async () => {
      const token = await refreshToken();
      return `Bearer ${token}`;
    }, 'Authorization')
  ]
});
```

### Resilience (timeout + retry)

```typescript
import { TimeoutFetch, RetryFetch } from '@ama-sdk/client-fetch';

const client = new ApiFetchClient({
  basePath: 'https://api.example.com',
  fetchPlugins: [
    new TimeoutFetch(15_000),
    new RetryFetch(
      3,
      (_context, data, error) => !!error || data?.status >= 500,
      (attempt) => attempt * 1000
    )
  ]
});
```

### Combined setup

```typescript
import { ApiKeyRequest, SessionIdRequest } from '@ama-sdk/core';
import { ApiFetchClient, TimeoutFetch, RetryFetch } from '@ama-sdk/client-fetch';

const client = new ApiFetchClient({
  basePath: 'https://api.example.com',
  requestPlugins: [
    new ApiKeyRequest(process.env.API_KEY, 'X-API-Key'),
    new SessionIdRequest()
  ],
  fetchPlugins: [
    new TimeoutFetch(30_000),
    new RetryFetch(2, (_ctx, resp) => resp?.status >= 500, () => 2000)
  ]
});
```

## Creating Custom Plugins

### Custom Request Plugin

A request plugin transforms `RequestOptions` before the HTTP call:

```typescript
import { PluginRunner, RequestOptions, RequestPlugin } from '@ama-sdk/core';

export class CorrelationIdRequest implements RequestPlugin {
  public load(): PluginRunner<RequestOptions, RequestOptions> {
    return {
      transform: async (data: RequestOptions) => {
        data.headers.append('X-Correlation-ID', crypto.randomUUID());
        return data;
      }
    };
  }
}
```

Register it:

```typescript
const client = new ApiFetchClient({
  basePath: 'https://api.example.com',
  requestPlugins: [new CorrelationIdRequest()]
});
```

### Custom Fetch Plugin

A fetch plugin wraps the HTTP call itself (for cross-cutting concerns like logging, metrics, circuit-breaking):

```typescript
import { PluginAsyncRunner } from '@ama-sdk/core';
import { FetchCall, FetchPlugin, FetchPluginContext, PluginAsyncStarter } from '@ama-sdk/client-fetch';

export class LoggingFetch implements FetchPlugin {
  public load(context: FetchPluginContext): PluginAsyncRunner<Response, FetchCall> & PluginAsyncStarter {
    return {
      transform: async (fetchCall: FetchCall) => {
        const start = performance.now();
        const response = await fetchCall();
        const duration = performance.now() - start;
        console.log(`[${context.url}] ${response.status} in ${duration.toFixed(0)}ms`);
        return response;
      }
    };
  }
}
```

Register it:

```typescript
const client = new ApiFetchClient({
  basePath: 'https://api.example.com',
  fetchPlugins: [new LoggingFetch(), new TimeoutFetch(30_000)]
});
```

### Plugin Ordering

Plugins execute in array order:
- **Request plugins**: first plugin transforms first, result passes to next
- **Fetch plugins**: first plugin wraps the outermost call (like middleware)

Place auth plugins first (so all requests are authenticated), then resilience plugins.

## Key Interfaces Reference

Read the authoritative interface definitions directly from source:

- **RequestPlugin / RequestOptions**: https://github.com/AmadeusITGroup/otter/blob/main/packages/@ama-sdk/core/src/plugins/core/request-plugin.ts
- **PluginRunner / PluginContext**: https://github.com/AmadeusITGroup/otter/blob/main/packages/@ama-sdk/core/src/plugins/core/plugin.ts
- **FetchPlugin / FetchPluginContext / FetchCall**: https://github.com/AmadeusITGroup/otter/blob/main/packages/@ama-sdk/client-fetch/src/fetch-plugin.ts
