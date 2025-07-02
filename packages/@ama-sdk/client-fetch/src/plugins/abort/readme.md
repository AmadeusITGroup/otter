## Abort

Plugin to abort a Fetch call.

### Usage examples

### Immediate abort on URL match

```typescript
import { AbortFetch, type AbortCallback } from '@ama-sdk/core';

const abortCondition: AbortCallback = ({url}) => url.endsWith('pet');

const client = new ApiFetchClient(
  {
    basePath: 'https://petstore3.swagger.io/api/v3',
    fetchPlugins: [new AbortFetch(abortCondition)]
  }
);
```

### Abort on external event

```typescript
import { AbortFetch, type AbortCallback } from '@ama-sdk/core';
import { firstValueFrom } from 'rxjs';
import { myObservable } from 'somewhere';

const abortCondition: AbortCallback = ((observable: any) => () => firstValueFrom(observable).then((value) => !!value))(myObservable);

const client = new ApiFetchClient(
  {
    basePath: 'https://petstore3.swagger.io/api/v3',
    fetchPlugins: [new AbortFetch(abortCondition)]
  }
);
```

### Abort on Timeout

```typescript
import { AbortFetch, type AbortCallback } from '@ama-sdk/core';

const abortCondition: AbortCallback = ({controller}) => { setTimeout(() => controller?.abort(), 3000); };

const client = new ApiFetchClient(
  {
    basePath: 'https://petstore3.swagger.io/api/v3',
    fetchPlugins: [new AbortFetch(abortCondition)]
  }
);
```

> [!WARN]
> We recommend to use the [Timeout plugin](https://github.com/AmadeusITGroup/otter/tree/main/packages/%40ama-sdk/core/src/plugins/timeout) to implement more easily and properly a request timeout.

### Type of plugins

- Fetch plugin: [AbortFetch](./abort.fetch.ts)
