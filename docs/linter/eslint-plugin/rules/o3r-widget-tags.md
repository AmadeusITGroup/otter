# @o3r/o3r-widget-tags

Ensures that @o3rWidget and @o3rWidgetParam are used with correct value.


**Warning** This rule must be configured to be used.

## How to use

```json
{
  "@o3r/o3r-widget-tags": [
    "error",
    {
      "supportedInterfaceNames": ["NestedConfiguration", "Configuration", "CustomConfigurationInterface"],
      "widgets": {
        "widgetName1": {
          "param1": "string",
          "param2": "number",
          "param3": "boolean",
          "param4": "string[]",
          "param5": "number[]",
          "param6": "boolean[]",
        },
        "widgetName2": {}
      }
    }
  ]
}
```
