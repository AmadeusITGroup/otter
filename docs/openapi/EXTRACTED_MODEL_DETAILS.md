# Extracted model details

As described in the [dependency resolution section](./DEPENDENCY_RESOLUTION_CONCEPT.md), the external dependency models are extracted in the `models_external` directory to be referred to by your local specification files.

The objectives of this mechanism are to:

- Be agnostic of the NodeJs package manager mechanism (and support `plug'n'play` module resolution)
- Allow the application of [transforms](./TRANSFORM.md) on top of definitions
- Support linking the `$ref` to the referred definition (thanks to the [VSCode OpenApi extension](https://marketplace.visualstudio.com/items?itemName=42Crunch.vscode-openapi))
- Support version overrides when exposed as dependencies

## Reference only

When there is no `transform` applied to the external model, the only purpose of the model file generated in `models_external` is to redirect to the correct dependency path (concretely in `node_module`).\
To simplify, only a `$ref` will be printed in the generated model file.\
For example:

```json5
// in openapi.manifest.json
{
  "models": {
    "@my/spec": "models/example.v1.yaml"
  }
}
```

will generate the file:

```yaml
# in models_external/my-spec/models/example.v1.yaml
x-internal-reference-generated: true
$ref: ../../../node_modules/@my/spec/models/example.v1.yaml
x-internal-source: '@my/spec/models/example.v1.yaml'
x-internal-version: '1.2.0'
x-internal-masked: false
x-internal-touched: false
```

A transformed model is a model generated in `models_external` directory on which one or several [transformations](./TRANSFORM.md) have been applied.\
The model will also include additional [annotations](#model-annotations) according to the updated parts.
> When multiple `transform` sets are applied to a single model, this results in the generation of multiple model files in `models_external`. See [manifest examples](./MANIFEST_CONFIGURATION.md#manifest-schema) for more details.

## Model annotations

Transformed model are generated in the `models_external` directory. They shall be annotated with the following [x-vendor](https://swagger.io/docs/specification/v3_0/openapi-extensions/) fields:

| Annotation | Position | Description |
| --- | --- | --- |
| `x-internal-masked` | model root | Indicates that the model has been masked |
| `x-internal-touched` | model root | Indicates that the model has be modified by any [transform](./TRANSFORM.md) |
| `x-internal-source` | model root | Original model reference before transformation |
| `x-internal-version` | model root | Version of the artifact exposition the original model |
| `x-internal-reference-rewritten` | beside `$ref` node | Indicates that the associated `$ref` value has been updated |
| `x-internal-reference-generated` | beside `$ref` node | Indicates that the associated `$ref` has been generated and targets a local file |
