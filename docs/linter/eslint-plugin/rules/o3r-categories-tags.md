# @o3r/o3r-categories-tags

Ensures that @o3rCategories and @o3rCategory are used with correct value.

## How to use

```json
{
  "@o3r/o3r-categories-tags": [
    "error",
    {
      "supportedInterfaceNames": ["NestedConfiguration", "Configuration", "CustomConfigurationInterface"],
      "globalConfigCategories": ["globalCategory"]
    }
  ]
}
```

## Valid code example

```typescript
/**
 * @o3rCategories localCategory
 */
export interface ConfigExample extends Configuration {
  /**
   * @o3rCategory globalCategory
   */
  prop1: string;
  /**
   * @o3rCategory localCategory
   */
  prop2: string;
}
```

## Invalid code example

```typescript
export interface ConfigExample extends Configuration {
  /**
   * @o3rCategory unknownCategory
   */
  prop: string | number;
}
```

```typescript
/**
 * @o3rCategories globalCategory
 */
export interface ConfigExample extends Configuration {
  /**
   * @o3rCategory globalCategory
   */
  prop: string;
}
```

```typescript
/**
 * @o3rCategories localCategory
 */
export interface ConfigExample extends Configuration {
  /**
   * @o3rCategory globalCategory
   * @o3rCategory localCategory
   */
  prop: string;
}
