---
name: create-mask
description: Create a field mask for an OpenAPI model to expose only specific fields. Configures the transforms.masks section in openapi.manifest.json to limit model to selected properties.
---

# Create Field Mask

Creates a field mask for an OpenAPI model, limiting it to specific fields. This is useful when you want to expose only a subset of a model's properties in your API.

## Usage

Use this skill when you need to:

- Expose only specific fields from a model
- Create different views of the same model (e.g., public vs internal)
- Reduce payload size by excluding unnecessary fields
- Hide sensitive fields from external APIs
- Create simplified versions of complex models

## Process

### Step 1: Locate the Model

Find the model in `openapi.manifest.json` (or `openapi.manifest.yaml`) under the `models` section.

### Step 2: Add Mask Transform

Add a `transforms.masks` section to the model configuration with a structure that mirrors the original model but only includes the fields you want to expose, each set to `true`.

## Structure

A mask has the same structure as the original model but only includes the fields to expose:

```json
{
  "models": {
    "<library-or-model-name>": {
      "path": "<path-to-model>",
      "transforms": {
        "masks": {
          "properties": {
            "field1": true,
            "field2": true,
            "field3": true
          }
        }
      }
    }
  }
}
```

## Examples

### Example 1: Simple Field Mask

Original model `User` has: `id`, `name`, `email`, `password`, `createdAt`, `updatedAt`

Creating a public mask with only safe fields:

```json
{
  "models": {
    "User": {
      "path": "./models/User.yaml",
      "transforms": {
        "masks": {
          "properties": {
            "id": true,
            "name": true,
            "email": true
          }
        }
      }
    }
  }
}
```

Result: Only `id`, `name`, and `email` are exposed. `password`, `createdAt`, and `updatedAt` are hidden.

### Example 2: Nested Field Mask

For a model with nested objects:

```json
{
  "models": {
    "Order": {
      "path": "./models/Order.yaml",
      "transforms": {
        "masks": {
          "properties": {
            "orderId": true,
            "status": true,
            "customer": {
              "properties": {
                "name": true,
                "email": true
              }
            },
            "items": true
          }
        }
      }
    }
  }
}
```

This masks the `Order` model to show only `orderId`, `status`, `items`, and a subset of `customer` fields.

### Example 3: External Library Model

Masking a model from an external library:

```json
{
  "models": {
    "@travel/api-models": {
      "path": "@travel/api-models/models/Flight.yaml",
      "transforms": {
        "masks": {
          "properties": {
            "flightNumber": true,
            "departure": true,
            "arrival": true,
            "price": true
          }
        }
      }
    }
  }
}
```

## YAML Format

If using `openapi.manifest.yaml`:

```yaml
models:
  User:
    path: ./models/User.yaml
    transforms:
      masks:
        properties:
          id: true
          name: true
          email: true
```

## Advanced Usage

### Multiple Masks

You can create multiple named masks for the same model:

```json
{
  "transforms": {
    "masks": {
      "public": {
        "properties": {
          "id": true,
          "name": true
        }
      },
      "internal": {
        "properties": {
          "id": true,
          "name": true,
          "email": true,
          "createdAt": true
        }
      }
    }
  }
}
```

### Combining with Rename

You can use masks together with rename transforms:

```json
{
  "models": {
    "UserProfile": {
      "path": "./models/UserProfile.yaml",
      "transforms": {
        "rename": "User",
        "masks": {
          "properties": {
            "id": true,
            "name": true,
            "email": true
          }
        }
      }
    }
  }
}
```

## Important Notes

- Masks don't modify the source specification
- All fields not explicitly set to `true` are excluded
- Nested objects require explicit property mapping
- Arrays of objects inherit the mask from the object definition
- After creating masks, regenerate your code to apply changes
- Masked fields are completely removed from generated types/interfaces

## Common Use Cases

1. **Security**: Hide sensitive fields like passwords or tokens
2. **Performance**: Reduce payload size for mobile APIs
3. **Versioning**: Create different API versions with different field sets
4. **Privacy**: Remove PII for external consumers
5. **Simplification**: Create lightweight versions of complex models
