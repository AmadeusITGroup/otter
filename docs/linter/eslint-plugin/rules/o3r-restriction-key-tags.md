# @o3r/o3r-restriction-key-tags

Ensures that the tags `@o3rRestrictionKey` are used with correct values.

> [!WARNING]
> This rule must be configured to be used.

## How to use

```json
{
  "@o3r/o3r-restriction-key-tags": [
    "error",
    {
      "supportedInterfaceNames": ["NestedConfiguration", "Configuration", "CustomConfigurationInterface"],
      "supportedKeys": ["restriction", "restriction_with_underscores", "restriction with spaces"]
    }
  ]
}
```

## Valid code example

```typescript
export interface ConfigExample extends Configuration {
  /**
   * @o3rRestrictionKey restriction_with_underscores
   */
  prop1: string;
  /**
   * @o3rRestrictionKey restriction
   * @o3rRestrictionKey "restriction with spaces"
   */
  prop2: string;
}
```

## Invalid code example

```typescript
export interface ConfigExample extends Configuration {
  /**
   * @o3rRestrictionKey restriction with spaces
   */
  prop: string;
}
```

```typescript
export interface ConfigExample extends Configuration {
  /**
   * @o3rRestrictionKey unknownRestriction
   */
  prop: string | number;
}
```

```typescript
export interface NotAConfigInterface {
  /**
   * @o3rRestrictionKey restriction
   */
  prop: string;
}
```
