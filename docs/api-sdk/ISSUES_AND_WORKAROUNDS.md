# Issues and workarounds

## `properties` for `allOf` instruction

Currently, using `properties` along with the `allOf` instruction is not supported by the SDK generator. For instance, it can incorrectly handle `enum` generation.

```yaml
Dog:
  allOf:
    - $ref: '#/components/schemas/Pet'
  properties:
    bark:
      type: boolean
    breed:
      type: string
      enum: [Dingo, Husky, Retriever, Shepherd]
```

It will not generate the `breed` enum.

As a workaround, you can pass the properties as an object to the `allOf` array as follows:

```yaml
Dog:
  allOf:
    - $ref: '#/components/schemas/Pet'
    - type: object
      properties:
        bark:
          type: boolean
        breed:
          type: string
          enum: [Dingo, Husky, Retriever, Shepherd]
```

This will generate:
```typescript
export type BreedEnum = 'Dingo' | 'Husky' | 'Retriever' | 'Shepherd';
```

The issue is tracked via https://github.com/AmadeusITGroup/otter/issues/3017.
