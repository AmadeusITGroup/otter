# Custom Decorators

The plugin offers additional Redocly decorators that you can pick and choose in the Redocly configuration

## Decorator `redirect-refs`

This custom decorator helps redirect the references to any specified URL after the bundling process.

**Available for the formats :**

`oas3`, `oas2`, `async3` and `async2`

**Example of usage :**

```yaml
# Redirect the references to a model in `my-models/` to `https://my-spec.website.com/` URL

plugins:
  - '@ama-openapi/redocly-plugin'

apis:
  mySpec:
    root: apis/mySpec.json
    decorators:
      ama-openapi/redirect-ref:
        rules:
          - redirectUrl: "https://my-spec.website.com/"
            includeRefPatterns: "my-models/.*"
```

will turn the spec :

```yaml

paths:
  '/example-url':
    get:
      responses:
        "200":
          $ref: "#/components/schemas/model1"
components:
  schema:
    model1:
      $ref: my-models/somewhere

```

to:

```yaml

paths:
  '/example-url':
    get:
      responses:
        "200":
          $ref: "#/components/schemas/model1"
components:
  schema:
    model1:
      $ref: https://my-spec.website.com/

```

**Options available :**

| Options | Type | Description |
| --- | --- | --- |
| `rules` | `array` | List of rules to be apply to the specification references |
| `rules.includeRefPatterns` *(optional)* | `string` or `string[]` | Pattern the `$ref` url should match to apply the redirection if specified.<br /> In case a list is provided, at least one from the list should match to apply the redirection. |
| `rules.excludeRefPatterns`*(optional)*  | `string` or `string[]` | Pattern the `$ref` url should match to apply the redirection if specified.<br /> In case a list is provided, at least one from the list should match to apply the redirection. |
| `rules.hasTag` *(optional)* | `string` | Not only the model should have the reference, but a specific `x-vendor` tag must be present, if specified, in order to apply the transformation. |
| `rules.redirectUrl` | `string` | Redirect the reference to a define URL |
| `rules.keepFinalInnerPath` *(optional)* | `boolean` | Determine the final inner path should be kept. The final inner path is ignored otherwise. |

## Decorator `remove-unused-components`

This decorator removes the components with no reference from the bundled specification.

**Available for the formats :**

`oas3`

**Example of usage :**

```yaml
plugins:
  - '@ama-openapi/redocly-plugin'

apis:
  mySpec:
    root: apis/mySpec.json
    decorators:
      ama-openapi/remove-unused-components: on
```

will turn the spec :

```yaml
paths:
  '/example-url':
    get:
      responses:
        "200":
          $ref: "#/components/schemas/model3"
components:
  schema:
    model1:
      type: object
    model2:
      type: object
      properties:
        ref:
          $ref: "#/components/schemas/model1"
    model3:
      type: object
```

To:

```yaml
paths:
  '/example-url':
    get:
      responses:
        "200":
          $ref: "#/components/schemas/model3"
components:
  schema:
    model3:
      type: object
```

> [!NOTE]
> The purpose of this plugin is to support inter-dependencies which is currently missing in the Redocly built-in [remove-unused-components](https://redocly.com/docs/cli/decorators/remove-unused-components).
> This plugin will be deprecated in favor to the built-in plugin when  [the Redocly issue](https://github.com/Redocly/redocly-cli/issues/1783) is fixed

## Decorator `enforce-discriminator-mandatory`

This decorator enforces that discriminator fields are required in OpenAPI schemas. When a schema contains a discriminator, this decorator automatically adds the discriminator property to the schema's `required` array if it's not already present. This ensures compliance with OpenAPI best practices for polymorphic schemas.

**Available for the formats:**

`oas3`, `oas2`, `async3` and `async2`

**Example of usage:**

```yaml
plugins:
  - '@ama-openapi/redocly-plugin'

apis:
  mySpec:
    root: apis/mySpec.json
    decorators:
      ama-openapi/enforce-discriminator-mandatory: on
```

will turn the spec:

```yaml
components:
  schemas:
    Pet:
      type: object
      discriminator:
        propertyName: petType
      properties:
        petType:
          type: string
        name:
          type: string
      required:
        - name
```

to:

```yaml
components:
  schemas:
    Pet:
      type: object
      discriminator:
        propertyName: petType
      properties:
        petType:
          type: string
        name:
          type: string
      required:
        - name
        - petType
```

**Options available:**

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `flagAddedDiscriminator` *(optional)* | `boolean` | `false` | If `true`, adds an `x-added-required-discriminator` flag to schemas where the discriminator property was added to the required array. Useful for debugging or tracking which schemas were modified. |

**Example with options:**

```yaml
decorators:
  ama-openapi/enforce-discriminator-mandatory:
    flagAddedDiscriminator: true
```

> [!NOTE]
> This decorator works with both OAS 2.0 (where discriminator is a string) and OAS 3.0/3.1 (where discriminator is an object with a `propertyName` field). It will not duplicate the discriminator property if it's already in the required array.
