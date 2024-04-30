# Otter Rules Engine - Basic Rule Example

## Introduction

For this simple use case, let's consider an application which will update a configuration to limit the number of
items of a component based on the user's device.

In this Ruleset we consider the following:
* The component to update is the `O3rDummyComponent` exposed in the `@o3r/dummy-lib`
* `isMobileDevice` is a fact that will emit a boolean depending on whether the flow is executed on a desktop or
mobile device.
* The configuration to modify the number of displayed items in the page is `numberItemsPerPage`

## Ruleset
```json5
{
  "schema": "https://raw.githubusercontent.com/AmadeusITGroup/otter/main/packages/%40o3r/rules-engine/schemas/rulesets.schema.json",
  "rulesets": [
    {
      "id": "6194b61a-1bf3-4c02-8b7c-20f782d68324",
      "name": "Showcase the nested rules",
      "disabled": false,
      "rules": [
        {
          "id": "6e8t54h6s4e-6erth46sre8th4-d46t8s13t5j1",
          "name": "the only rule",
          "inputRuntimeFacts": [],
          "outputRuntimeFacts": [],
          "rootElement": {
            "elementType": "RULE_BLOCK",
            "blockType": "IF_ELSE",
            "condition": {
              "any": [
                {
                  "lhs": {
                    "type": "FACT",
                    "value": "isMobileDevice"
                  },
                  "operator": "equals",
                  "rhs": {
                    "type": "LITERAL",
                    "value": true
                  }
                }
              ]
            },
            "successElements": [
              {
                "elementType": "ACTION",
                "actionType": "UPDATE_CONFIG",
                "component": "o3r-dummy-component",
                "library": "@o3r/dummy-lib",
                "property": "numberItemsPerPage",
                "value": 10
              }
            ],
            "failureElements": [
              {
                "elementType": "ACTION",
                "actionType": "UPDATE_CONFIG",
                "component": "o3r-dummy-component",
                "library": "@o3r/dummy-lib",
                "property": "numberItemsPerPage",
                "value": 50
              }
            ]
          }
        }
      ]
    }
  ]
}
```
