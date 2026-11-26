## OAuth 2.0 Authorization Code + PKCE

Plugin to call an API Gateway (micro-gateway) directly from a Single Page Application, **without BFF**, using the
[OAuth 2.0 Authorization Code flow with PKCE](https://datatracker.ietf.org/doc/html/rfc7636) (browser-based pattern).

The plugin:

- redirects the user to the Authorization Server with the PKCE `code_challenge` (`S256`) and a `state` (CSRF protection),
- exchanges the authorization code for a token set once redirected back to the application,
- adds the access token as `Bearer` in the `Authorization` header of each request,
- renews the expired access token via the refresh token (if provided by the Authorization Server),
- triggers a new authentication (frictionless thanks to SSO) when no valid token is available.

> [!IMPORTANT]
> The Backend For Frontend (BFF) pattern remains the preferred option. This plugin is intended for applications calling
> a gateway able to verify access tokens obtained via Authorization Code + PKCE, with a single audience/scope.
> Avoid requesting "super tokens" with all the rights of the application: keep the least privileges.

### Type of plugins

- Request plugin: [OAuth2PkceRequest](./oauth2-pkce-request.ts)

### Token storage

The `tokenStorage` and `transactionStorage` options accept the standard [Web Storage API](https://developer.mozilla.org/docs/Web/API/Storage) (`getItem`, `setItem`, `removeItem`) or its asynchronous equivalent (`OAuth2Storage` type):

- the browser `sessionStorage` / `localStorage`,
- the NodeJS [Web Storage API](https://nodejs.org/api/globals.html#localstorage) (`sessionStorage`, and `localStorage` when NodeJS runs with `--localstorage-file`),
- `InMemoryStorage`, the in-memory implementation of the Web Storage API provided by this package,
- any asynchronous key-value store exposing `getItem`, `setItem` and `removeItem` returning promises (IndexedDB wrapper, server-side store, etc.).

| `tokenStorage`                                   | Cleared on (browser) | Shared between tabs |
| ------------------------------------------------ | -------------------- | ------------------- |
| `new InMemoryStorage()` (default, **preferred**) | page refresh         | No                  |
| `sessionStorage`                                 | window / tab close   | No                  |
| `localStorage`                                   | logout               | Yes                 |

The token set is serialized in JSON under the `tokenStorageKey` key (`ama-sdk-oauth2-token` by default). Browser storages increase the surface of XSS attacks to steal the tokens.

The pending authorization transaction (`state` and `code_verifier`) is kept in the global `sessionStorage` (available in browsers and NodeJS >= 25, or NodeJS >= 22.4 with the `--experimental-webstorage` flag) to survive the redirection to the Authorization Server. Another storage can be provided via the `transactionStorage` option.

### Example

```typescript
import { OAuth2PkceRequest } from '@ama-sdk/core';
import { ApiFetchClient, OAuth2PkceUnauthorizedFetch } from '@ama-sdk/client-fetch';

const oauth2Plugin = new OAuth2PkceRequest({
  clientId: 'my-client-id',
  authorizationEndpoint: 'https://idp.example.com/oauth2/authorize',
  tokenEndpoint: 'https://idp.example.com/oauth2/token',
  redirectUri: `${window.location.origin}/callback`,
  scope: 'openid my-api-scope'
});

// On application bootstrap, handle the redirection from the Authorization Server
if (oauth2Plugin.isRedirectCallback()) {
  const { appState } = await oauth2Plugin.handleRedirectCallback();
  // remove the `code` and `state` from the URL and restore the application state
  window.history.replaceState({}, '', appState ?? '/');
}

const apiClient = new ApiFetchClient({
  basePath: 'https://mgw.example.com/api',
  requestPlugins: [oauth2Plugin],
  // Optional: renew the token and replay the call when rejected by the gateway (401)
  fetchPlugins: [new OAuth2PkceUnauthorizedFetch(oauth2Plugin)]
});
```

The `appState` passed to `oauth2Plugin.login({ appState: window.location.pathname })` is returned by `handleRedirectCallback`.
By default, the plugin redirects to the Authorization Server (and rejects the call) when no valid token is available; this behavior can be customized with the `onLoginRequired` option.

### Customize the token requests

The requests to the token endpoint (authorization code exchange and token refresh) are sent with `fetch` and do not go through the SDK plugins of the API client.
They can be customized with the `requestToken` option, which receives the `RequestOptions` of the call (the `basePath` being the token endpoint) and returns the `Response` parsed by the plugin.

For example, to send the [bot protection](https://github.com/AmadeusITGroup/otter/tree/main/packages/%40ama-sdk/core/src/plugins/bot-protection-fingerprint) fingerprint with the token requests too:

```typescript
import { BotProtectionFingerprintRequest, impervaProtectionRetrieverFactory, OAuth2PkceRequest } from '@ama-sdk/core';

const botProtection = new BotProtectionFingerprintRequest({
  destinationHeaderName: 'X-D-Token',
  fingerprintRetriever: impervaProtectionRetrieverFactory(200, 200)
});
const botProtectionRunner = botProtection.load();

const oauth2Plugin = new OAuth2PkceRequest({
  // ...
  requestToken: async (requestOptions) => {
    const options = await botProtectionRunner.transform(requestOptions);
    return fetch(options.basePath, options);
  }
});

const apiClient = new ApiFetchClient({
  basePath: 'https://mgw.example.com/api',
  // the bot protection plugin is set first to be applied even if the authentication is required
  requestPlugins: [botProtection, oauth2Plugin]
});
```
