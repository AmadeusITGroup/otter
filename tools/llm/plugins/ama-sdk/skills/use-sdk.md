---
name: use-sdk
description: Install, configure, and use a TypeScript SDK generated with @ama-sdk. Use when user wants to call APIs, set up a client (fetch, Angular, beacon), or understand how to use an existing SDK package.
---

# Use SDK

Install an @ama-sdk-generated TypeScript SDK, configure an API client, and make API calls.

## Choosing a Client

| Client | Package | Best For |
|--------|---------|----------|
| **ApiFetchClient** | `@ama-sdk/client-fetch` | Node.js, browsers, standalone apps, SSR, Angular apps with `ApiManager` |
| **ApiAngularClient** | `@ama-sdk/client-angular` | Angular apps needing `HttpClient` (interceptors, SSR transfer state) |
| **ApiBeaconClient** | `@ama-sdk/client-beacon` | Fire-and-forget tracking/analytics calls |

In Angular apps, prefer `ApiFetchClient` with `ApiManager` (see below) unless you specifically need Angular's `HttpClient` features (interceptors, transfer state).

## Setup: ApiFetchClient (Standalone / Node.js / Browser)

### Install

```bash
# @my-org/my-sdk is a placeholder for the generated SDK package name
npm install @ama-sdk/client-fetch @ama-sdk/core @my-org/my-sdk
```

### Configure

```typescript
import { ApiFetchClient } from '@ama-sdk/client-fetch';
import { PetApi } from '@my-org/my-sdk';

const client = new ApiFetchClient({
  basePath: 'https://api.example.com/v1',
  requestPlugins: [],
  fetchPlugins: []
});

const petApi = new PetApi(client);
```

### Constructor Options

For the full list of options, read the source interfaces:

- **ApiFetchClient options**: https://github.com/AmadeusITGroup/otter/blob/main/packages/@ama-sdk/client-fetch/src/api-fetch-client.ts (see `BaseApiFetchClientOptions` and `BaseApiFetchClientConstructor`)
- **Base options** (shared by all clients): https://github.com/AmadeusITGroup/otter/blob/main/packages/@ama-sdk/core/src/fwk/core/base-api-constructor.ts (see `BaseApiClientOptions`)

## Setup: ApiAngularClient (Angular Apps)

### Install

```bash
ng add @ama-sdk/client-angular
npm install @my-org/my-sdk
```

### Configure

```typescript
import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiAngularClient } from '@ama-sdk/client-angular';

const client = new ApiAngularClient({
  httpClient: inject(HttpClient),
  basePath: 'https://api.example.com/v1'
});
```

In practice, don't instantiate clients manually in services — use **ApiManager** (see below) to centralize configuration.

### Options Reference

- **ApiAngularClient options**: https://github.com/AmadeusITGroup/otter/blob/main/packages/@ama-sdk/client-angular/src/api-angular-client.ts (see `BaseApiAngularClientOptions`)
- **AngularPlugin interface**: https://github.com/AmadeusITGroup/otter/blob/main/packages/@ama-sdk/client-angular/src/angular-plugin.ts

## Angular: Centralized API Management with ApiManager

In Angular applications, use `@o3r/apis-manager` to centralize client configuration across all your APIs instead of manually instantiating each API class. Works with any client (`ApiFetchClient` or `ApiAngularClient`). The `ApiManager` holds a default client configuration (applied to all APIs) and optional per-API overrides.

### Install

```bash
ng add @o3r/apis-manager
```

### Setup with provideApiManager

```typescript
import { ApplicationConfig } from '@angular/core';
import { ApiKeyRequest } from '@ama-sdk/core';
import { ApiFetchClient } from '@ama-sdk/client-fetch';
import { ApiManager, provideApiManager } from '@o3r/apis-manager';

const apiManager = new ApiManager(
  // Default configuration for all APIs
  new ApiFetchClient({
    basePath: 'https://api.example.com',
    requestPlugins: [new ApiKeyRequest('Bearer my-token', 'Authorization')]
  }),
  // Per-API overrides (replaces default plugins entirely for that API)
  {
    StoreApi: new ApiFetchClient({
      basePath: 'https://api.example.com',
      requestPlugins: [new ApiKeyRequest('store-secret', 'X-Store-Key')],
      fetchPlugins: [new TimeoutFetch(60_000)]
    })
  }
);

export const appConfig: ApplicationConfig = {
  providers: [
    provideApiManager(apiManager)
  ]
};
```

### Retrieving API instances

Inject `ApiFactoryService` to get API instances pre-configured with their plugins:

```typescript
import { ApiFactoryService } from '@o3r/apis-manager';
import { PetApi } from '@my-org/my-sdk';

@Injectable()
class PetService {
  private readonly petApi = inject(ApiFactoryService).getApi(PetApi);
}
```

### Override configuration at runtime

```typescript
import { ApiManager, ApiFactoryService } from '@o3r/apis-manager';
import { ApiFetchClient } from '@ama-sdk/client-fetch';
import { ExampleApi } from '@my-org/my-sdk';

@Injectable()
class MyService {
  private readonly apiManager = inject(ApiManager);
  private readonly apiFactoryService = inject(ApiFactoryService);

  updateConfig() {
    this.apiManager.setConfiguration(new ApiFetchClient({...}), ExampleApi.apiName);
    const api = this.apiFactoryService.getApi(ExampleApi, true); // true = refresh cache
  }
}
```

### Key behavior

- Per-API overrides **replace** the default plugins entirely (no merging).
- Use `INITIAL_APIS_TOKEN` to swap SDK implementations at app level without changing library code.

## Setup: ApiBeaconClient (Tracking)

### Install

```bash
npm install @ama-sdk/client-beacon @my-org/my-sdk
```

### Configure

```typescript
import { ApiBeaconClient } from '@ama-sdk/client-beacon';
import { TrackingApi } from '@my-org/my-sdk';

const client = new ApiBeaconClient({
  basePath: 'https://tracking.example.com'
});

const trackingApi = new TrackingApi(client);
```

Use for fire-and-forget requests (e.g., analytics, page views). Beacon requests survive page navigation.

### Beacon-specific Options

For the full list of Beacon client options, read the source:

- **ApiBeaconClient options**: https://github.com/AmadeusITGroup/otter/blob/main/packages/@ama-sdk/client-beacon/src/api-beacon-client.ts (see `BaseApiBeaconClientOptions`)

## Making API Calls

All generated API classes follow the same pattern:

```typescript
// Simple GET
const pets = await petApi.listPets();

// GET with parameters
const pet = await petApi.getPetById({ petId: '123' });

// POST with body
const newPet = await petApi.createPet({
  CreatePetRequest: { name: 'Fido', species: 'dog' }
});

// With request options override
const result = await petApi.listPets({}, {
  headers: new Headers({ 'X-Custom': 'value' })
});
```

## Model Hierarchy

Generated SDKs use a three-level model hierarchy:

1. **Base models** (`src/models/base/`) — Direct TypeScript interfaces from the spec. Regenerated on every `typescript-core` run. Do not edit.
2. **Core models** (`src/models/core/`) — Extended models with runtime features (revivers, factories). Safe to customize.
3. **Custom models** — Your own extensions built on top of core models.

### Revivers

Revivers transform raw JSON responses into typed model instances:

```typescript
import { revivePet } from '@my-org/my-sdk';

// Automatic: ReplyPlugin 'reviver' handles this by default
// Manual usage:
const rawJson = await fetch('/pets/1').then(r => r.json());
const typedPet = revivePet(rawJson);
```

The default `replyPlugins` include a `ReviverReply` that automatically applies revivers to API responses.

## Error Handling

The default `replyPlugins` include an `ExceptionReply` that throws typed errors:

```typescript
try {
  const pet = await petApi.getPetById({ petId: 'invalid' });
} catch (error) {
  // error contains status, headers, and parsed body
  console.error(error.status); // e.g., 404
}
```

