# @o3r/project-json-tags

Ensures that the tags inside project.json are used with correct values.

> [!WARNING]
> This rule must be configured to be used.

## How to use

```json
{
  "@o3r/project-json-tags": [
    "error",
    {
      "allowedTags": ["access:private", "hook:postinstall"],
    }
  ]
}
```
