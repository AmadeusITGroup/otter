# Transforms

Before being exposed to be used by your specifications, a dependency model can be transformed via options defined in the [manifest configuration](./MANIFEST_CONFIGURATION.md).\
The following transformation are available:

| Transform name | Description |
| --- | --- |
| `fileRename` | Allow renaming a model file name and allow referring the original name with the keyword `$1`. <br /> *Example: `"myPrefix_$1"` will prefix the model.* <br /> Note that the filename is used by [Redocly bundle](https://redocly.com/docs/cli/commands/bundle) to generate the final model name. |
| `titleRename` | Allow renaming a model title name and allow referring the original name with the keyword `$1`.<br /> *Example: `"myPrefix_$1"` will prefix the model title.* Note that the field `title` is ignored by Redocly. |
| `mask` | Mask to apply to the model as [defined in stoplight](https://meta.stoplight.io/docs/platform/2nebi9gb2ankj-override-model-properties) |

## Definition of a transform

There are 2 ways to define a transform for a specific model.

1. Directly inside the [manifest file](./MANIFEST_CONFIGURATION.md) like in the following example:

```yaml
# in openapi.manifest.yaml
models:
  "@my/specification-package":
    path: "models/ExampleModel.v1.yaml"
    transform:
      fileRename: "new-model-name.json"
      mask:
        properties:
          field1:
```

2. In a dedicated file:

```yaml
# in openapi.manifest.yaml
models:
  "@my/specification-package":
    path: "models/ExampleModel.v1.yaml"
    transform: "./transform-example.yaml"
```

```yaml
# in openapi.manifest.yaml
fileRename: "new-model-name.json"
mask:
  properties:
    field1:
```

> [!TIP]
> Both `json` and `yaml` format files are supported.

## Mask Features

The mask feature offers 4 main capabilities:

- Filter the fields of a model object `properties`
- Override object property's value
- Add object property
- Be applied on referenced objects

<details>

<summary>Example</summary>

For the following models:

```yaml
# in models/example.v1.yaml
type: object
properties:
  field1:
    type: string
    description: my first string
  field2:
    type: string
    description: my other string
  uselessField:
    type: string
  field3:
    $ref: ./sub-example.v1.yaml
```

and

```yaml
# in models/sub-example.v1.yaml
type: object
properties:
  subField1:
    type: string
    description: my first string
  subField2:
    type: string
```

The following mask:

```yaml
property:
  field1:
  field2:
    description: "my second string"
  field3:
    property:
      subField1:
```

will result to:

```yaml
# in model_external/models/example.v1.yaml
type: object
properties:
  field1:
    type: string
    description: my first string
  field2:
    type: string
    description: my second string # overridden
  field3:
    $ref: ./example.v1/models/sub-example.v1.yaml
```

```yaml
# in model_external/models/example.v1/models/sub-example.v1.yaml
type: object
properties:
  subField1:
    type: string
    description: my first string
```

</details>
