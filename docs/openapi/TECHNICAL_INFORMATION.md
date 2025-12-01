# Technical information

## Schema Validation

The package includes 2 JSON schemas which can be used to validate configurations. The schemas are the following:

- A JSON schema to validate the [manifest configuration](./MANIFEST_CONFIGURATION.md) is available at: [@ama-openapi/core/schemas/manifest.schema.json](../../packages/@ama-openapi/core/schemas/manifest.schema.json).
- A JSON schema to validate the [transform files](./TRANSFORM.md) is available at: [@ama-openapi/core/schemas/transform.schema.json](../../packages/@ama-openapi/core/schemas/transform.schema.json).

You can use these schemas in your IDE or build tools to get validation and autocomplete support for manifest files.

> [!NOTE]
> The project generator [@ama-openapi/create](https://www.npmjs.com/package/@ama-openapi/create) prepares the manifest configuration file (and `package.json` file) to refer to the `manifest.schema.json` file.

## Renovate configuration

The package exposes a Renovate preset to help upgrade and consolidate dependencies related to the Ama OpenAPI ecosystem at: [@ama-openapi/core/renovate/default.json](../../packages/@ama-openapi/core/renovate/default.json).

It can be imported with:

```json5
// in renovate.json
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": [
    "github>AmadeusITGroup/otter//packages/@ama-openapi/core/renovate"
  ]
}
```

## Custom installer

Instead of using the default CLI from [@ama-opanapi/cli](https://www.npmjs.com/package/@ama-openapi/cli), a custom installer can be implemented locally using the function `installDependencies` exposed by this package:

```typescript
// in a any .mts file
import { installDependencies } from '@ama-openapi/core';

/** Example of options */
const options: {
  cwd: process.cwd()
  logger: console
};

await installDependencies(options);
```
