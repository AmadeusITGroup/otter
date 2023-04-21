## Simple API Key Authentication

Plugin to handle the Simple API key authentication with Apigee.
Note that this authentication mode has to be specifically activated per application and will be rejected by default.

Provide the clientId of your application as the `apiKey`.
It can be a simple *string* or a function that returns a *string* or a *Promise* if your application
needs to change it at runtime.

> You can also call the method `setApiKey` to change it programmatically.

The plugin `options` allows to customize the headers which the plugin injects the API key and context overrides into.

### Context overrides

Today only the Office ID is supported.
Like the `apiKey`, `options.officeId` can be a *string* or a function that returns a *string* or a *Promise*.

> You can also call the method `setOfficeId` to change it programmatically.

### Examples of usage

- Static API key no override

```typescript
const plugin = new SimpleApiKeyAuthenticationRequest('myApiKey');
```

- Static API key with static override

```typescript
const plugin = new SimpleApiKeyAuthenticationRequest('myApiKey', {
  officeId: 'NCE1A098A'
});
```

- Dynamic API key as a promise

```typescript
const apiKeyFactory = () => firstValueFrom(store.pipe(
    select(someStateSelector)
    map(state => determineApiKeyToUse(state))
  )
);
const plugin = new SimpleApiKeyAuthenticationRequest(apiKeyFactory);
```

- Dynamic API key and Office ID using setters

```typescript
const plugin = new SimpleApiKeyAuthenticationRequest('initialApiKey');
store.pipe(
  select(someStateSelector)
).subscribe(state => {
  plugin.setApiKey(determineApiKeyToUse(state));
  plugin.setOfficeId(determineOfficeIdOverride(state));
});
```

### Type of plugins

- Request plugin: [SimpleApiKeyAuthenticationRequest](./simple-api-key-authentication.request.ts)
