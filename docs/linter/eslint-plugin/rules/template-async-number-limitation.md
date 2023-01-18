# Limit the number of Async pipe on a single element

This rule limits the number of Async pipe on a single element.
It applies to Angular templates.

## Options

### maximumAsyncOnTag

Maximum number of async pipe on a single HTML element.

**Default**: 5

**Usage**:

```json
{
  "@o3r/template-async-number-limitation": [
    "error",
    {
      "maximumAsyncOnTag": 2
    }
  ]
}
```
