---
name: rename-model
description: Rename an OpenAPI model in your project by updating the transforms.rename field in openapi.manifest.json. Use when a model needs a different name in the generated code than in the source specification.
---

# Rename OpenAPI Model

Renames an OpenAPI model by configuring a transform in the manifest file, allowing you to use a different name in generated code than what appears in the original specification.

## Usage

Use this skill when you need to:
- Rename a model to give a dedicated name in for your openapi project
- Avoid naming conflicts with existing types
- Use more descriptive names for external models
- Maintain consistency across your API surface

## Process

### Step 1: Locate the Model in Manifest

Find the model in `openapi.manifest.json` (or `openapi.manifest.yaml`):

```json
{
  "models": {
    "<library-name>": {
      "path": "<library-name>/models/<current-model-name>.yaml"
    }
  }
}
```

### Step 2: Add Rename Transform

Add the `transforms.rename` field to the model configuration:

```json
{
  "models": {
    "<library-name>": {
      "path": "<library-name>/models/<current-model-name>.yaml",
      "transforms": {
        "rename": "<new-model-name>"
      }
    }
  }
}
```

## Example: Renaming an External Model

Renaming `FlightOffer` from `@travel/api-models` to `Flight`:

```json
{
  "models": {
    "@travel/api-models": {
      "path": "@travel/api-models/models/FlightOffer.yaml",
      "transforms": {
        "rename": "Flight"
      }
    }
  }
}
```

## YAML Format

If using `openapi.manifest.yaml`:

```yaml
models:
  UserProfile:
    path: ./models/UserProfile.yaml
    transforms:
      rename: User
```

## Important Notes

- The rename only affects the generated code, not the source specification
- References to this model in other specifications should use the original name
- Multiple models can be renamed independently
- Renaming doesn't change the underlying schema, only the type name
- After renaming, regenerate your code to apply the changes

## Common Use Cases

1. **Simplifying names**: `CustomerInformation` → `Customer`
2. **Adding context**: `Data` → `FlightData`
3. **Avoiding conflicts**: `Error` → `ApiError`
4. **Following conventions**: `user_profile` → `UserProfile`
