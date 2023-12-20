# @o3r/no-multiple-type-configuration-property

Ensures that the configuration property does not accept multiple types.

## How to use

```json
{
  "@o3r/no-multiple-type-configuration-property": [
    "error",
    {
      "supportedInterfaceNames": ["NestedConfiguration", "Configuration", "CustomConfigurationInterface"]
    }
  ]
}
```

## Valid code example

```typescript
export interface MyFirstConfig extends Configuration {
  myProp: string;
}
```

## Invalid code example

```typescript
export interface MyConfig extends Configuration {
  myProp: string | number;
}
```
