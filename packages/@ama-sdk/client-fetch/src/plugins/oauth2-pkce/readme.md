## OAuth 2.0 Authorization Code + PKCE - Unauthorized

Plugin to renew the OAuth 2.0 access token and replay the call once when it is rejected by the API Gateway (`401` by default).
The access token is renewed via the refresh token if available; otherwise the call fails with the original response.

It has to be used with the [OAuth2PkceRequest](https://github.com/AmadeusITGroup/otter/tree/main/packages/%40ama-sdk/core/src/plugins/oauth2-pkce) request plugin of `@ama-sdk/core`.

### Type of plugins

- Fetch plugin: [OAuth2PkceUnauthorizedFetch](./oauth2-pkce-unauthorized-fetch.ts)

### Example

```typescript
import { OAuth2PkceRequest } from '@ama-sdk/core';
import { ApiFetchClient, OAuth2PkceUnauthorizedFetch } from '@ama-sdk/client-fetch';

const oauth2Plugin = new OAuth2PkceRequest({ /* ... */ });

const apiClient = new ApiFetchClient({
  basePath: 'https://mgw.example.com/api',
  requestPlugins: [oauth2Plugin],
  fetchPlugins: [new OAuth2PkceUnauthorizedFetch(oauth2Plugin)]
});
```
