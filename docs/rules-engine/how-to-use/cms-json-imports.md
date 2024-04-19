# Import json in CMS

## Disclaimer : This feature is not supported by the CMS yet

Since not all projects will be able to use the CMS, it's possible to write directly the rules inside the json (cf examples).
If the application decides to migrate to the CMS, it will be able to import the json they are using : however, they are a few constraints :

* On a fact/literal comparison, the fact needs to be put on the LEFT
* Admin UI Constants (that will be replaced by a literal when exported from the CMS), can't be imported
* A flag needs to be added for each rule/ruleset that specified that the id have been manually added (generatedId : true)

# Manual ruleset JSON

## Disclaimer : this feature is to be used only until the CMS provides a complete rule editor.

To help you to write the ruleset, we have provided a JSON schema that you can use to get indication in your IDE.
This can be used as following:

```json5
{
  "$schema": "./node_module/@o3r/rules-engine/schemas/rulesets.schema.json",
  "ruleSets": [
    {
      "id": "e5th46e84-5e4th-54eth65seth46se8th2",
      "name": "the second ruleset",
      "linkedComponents": {
        "or": [
          {
            "library": "@scope/components",
            "name": "TestComponent"
          }
        ]
      },
      "rules": [
        ...
      ]
    }
  ]
}
```
> Note: In v10 and previously, we used `linkedComponent` property to activate a ruleset on demand. This becomes deprecated and will be removed in v12. Use `linkedComponents` instead;
