# Shareable specification

As the dependency system is based on NPM packages, a shareable specification should follow the requirements of an NPM package:

1. A `package.json` should be provided and should expose the files accessible by the consumer
2. The package should be published to an NPM registry thanks to the command `npm publish`
3. The relative references of the different models should be rewritten to target the same model from a different location.

## Shareable specification exposition

The `package.json` exposing the specification should have the following characteristics:

- A `name` and valid `version`.
- Exposing the models via the [exports field](https://docs.npmjs.com/cli/v11/configuring-npm/package-json#exports).

<details>

<summary>Example</summary>

```json5
// package.json
{
  "name": "@my-scope/spec",
  "version": "1.0.0",
  "exports": {
    "./package.json": "./package.json",
    "./models/*": "./models/*",
    ".": {
      "json": "./bundle/specification.json",
      "yaml": "./bundle/specification.yaml",
      "default": "./bundle/specification.yaml",
    },
  }
}
```

</details>

## Shareable specification external references

To ensure that the external references will be resolvable by the [Redocly bundle](https://redocly.com/docs/cli/commands/bundle) process when the consumer will reference one of your models, the following steps are required:

- The external references should target exclusively URL or files in `models_external/` directory.
- The package of externally referred models should be listed in the `dependencies` or the `package.json`
- The external models are extracted during the `postinstall` lifecycle of your package.

> [!WARNING]
> The `ignore-scripts` option from NPM will block the `postinstall` script run which we will to wrong dependency path recalculation.\
> To avoid it, the option should be disabled from `.npmrc` (or command line options) and the installation need to be rerun.

<details>

<summary>Example</summary>

```json5
// in package.json
{
  "name": "@my-scope/spec",
  "version": "1.0.0",
  "scripts": {
    "postinstall": "ama-openapi install" // generating the folder `models_external/`
  },
  "dependencies": {
    "@ama-openapi/cli": "latest",
    "@my-scope/other-spec": "^1.1.0"
  },
  "exports": {
    // ...
  },
  "models": {
    "@my-scope/other-spec": "models/share-model.yaml"
  }
}
```

```yaml
# in your models/example.v1.yaml
title: Example
type: object
properties:
  field:
    $ref: "../models_external/my-scope-other-spec/models/share-model.yaml"
```

</details>

> [!TIP]
> More details in [ama-openapi CLI documentation](https://github.com/AmadeusITGroup/otter/tree/main/packages/@ama-openapi/cli#expose-shareable-models).
