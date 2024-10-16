# Referencing

To complete the default [referencing](https://swagger.io/docs/specification/using-ref/) provided by the Swagger 2.0, the **Swagger Builder** supports two additional reference types:

1. `NPM package` reference via the package name
2. [split Swagger spec](./split-swagger-spec.md) reference via the `json` file
3. Remote specification reference via URL

The references can be used inside a `yaml` file via the `$ref` instruction or inside the tool configuration (via `CLI argument` or `spec` configuration).

Example inside argument:

```shell
swagger-builder @api/public-swagger-spec ./spec/my-override.yaml

# Will merge the Swagger specification from the @api/public-swagger-spec package with a local yaml file
```

Example inside a Swagger spec:

```yaml
definitions:
  Example:
    type: object
    allOf:
      - $ref: '@api/public-swagger-spec#/definitions/Example'
      - $ref: './split-spec/generate.config.json#/definitions/Example'
      - $ref: './my-spec.yaml#/definitions/Example'
      - $ref: 'https://raw.githubusercontent.com/OAI/OpenAPI-Specification/main/examples/v2.0/yaml/petstore.yaml#/definitions/Pet'

# will compose the object based on the definitions of Example from a NPM Artifact, a split Swagger specification and from a local yaml file.

# Note: ./split-spec/generate.config.json#/definitions/Example would be the same as ./split-spec/definitions/Example.yaml#/definitions/Example
```
