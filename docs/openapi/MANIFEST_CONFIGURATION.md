# Manifest Configuration

The dependency management system uses manifest files to define which OpenAPI models to include and how to process them. The package looks for manifest files in the following order:

- `ama-openapi.manifest.json`
- `ama-openapi.manifest.yaml`
- `ama-openapi.manifest.yml`
- `openapi.manifest.json`
- `openapi.manifest.yaml`
- `openapi.manifest.yml`

> [!TIP]
> In case no valid file from the previous list is found, the mechanism will parse the `package.json` file to find manifest definitions.

> [!IMPORTANT]
> To ensure proper exposure of its models, the manifest file need to be embedded in the artifact.
The manifest file follows a [specific schema](../../packages/@ama-openapi/core/schemas/manifest.schema.json) that lists the referenceable models and the `transform` fields applied to it.

## Manifest Schema

The manifest file follows a [specific schema](../../packages/@ama-openapi/core/schemas/manifest.schema.json) that lists the referenceable models and the `transform` fields applied to it.

**Examples:**

<details>

<summary>Single model</summary>

```json5
{
  "models": {
    "@my/specification-package": "models/ExampleModel.v1.yaml"
  }
}
```

Equivalent to:

```json5
{
  "models": {
    "@my/specification-package": {
      "path": "models/ExampleModel.v1.yaml"
    }
  }
}
```

</details>

<details>

<summary>Default package bundled specification</summary>

```json5
{
  "models": {
    "@my/specification-package": true
  }
}
```

</details>

<details>

<summary>Rename definition</summary>

```json5
{
  "models": {
    "@my/specification-package": {
      "path": "models/ExampleModel.v1.yaml",
      "transform": {
        "fileRename": "MyPrefix_$1",
      }
    }
  }
}
```

> [!NOTE]
> The keyword `$1` allows referencing the original file name. In this example, the final file will be `MyPrefix_ExampleModel.v1.yaml`.

</details>

<details>

<summary>Apply a single mask</summary>

```json5
{
  "models": {
    "@my/specification-package": {
      "path": "models/ExampleModel.v1.yaml",
      "transform": {
        "fileRename": "transformed_$1",
        "titleRename": "transformed_$1",
        "mask": {
          "properties": {
            "field": true
          }
        }
      }
    }
  }
}
```

</details>

<details>

<summary>Multiple masks for a single model</summary>

```json5
{
  "models": {
    "@my/specification-package": [
      {
        "path": "models/ExampleModel.v1.yaml",
        "transform": {
          "fileRename": "transformed1_$1",
          "mask": {
            "properties": {
              "field": true
            }
          }
        }
      },
      {
        "path": "models/ExampleModel.v1.yaml",
        "transform": {
          "fileRename": "transformed2_$1",
          "mask": {
            "properties": {
              "other": true
            }
          }
        }
      }
    ]
  }
}
```

</details>

> [!NOTE]
> A complete documentation relative to the masking feature is available in the [Transform section](./TRANSFORM.md).
