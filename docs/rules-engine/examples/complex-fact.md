# Otter Rules Engine - Complex Fact Example

## Introduction

In this example, let's see how to address rules on a fact that is not a boolean, a string or a number but a complex
object:

```typescript
// complexFact interface
interface ComplexFactInterface {
  arrayPropName: { propName: string }[]
}
```

In this Ruleset, we need to evaluate the value of the `propName` of the first item in `arrayPropName` and test
whether it is equal to `MY_SEARCHED_VALUE`.
While it would be possible to create a fact based on the `complexFact` that returns the value of `propName`,
you may not always be able to create a subset of each fact whenever you need it.

Instead, you can leverage the JSONPath query language to extract the subset of the fact that needs to be evaluated:
`$.arrayPropName[0].propName`.

> [!WARNING]
> We do not recommend using JSONPath on facts that are often updated as the rule will be evaluated every time the whole
> fact is updated and not just when the subset extracted from the fact is updated.
> This may entail performance issues.

## Ruleset

```json5
{
  "schema": "https://raw.githubusercontent.com/AmadeusITGroup/otter/main/packages/%40o3r/rules-engine/schemas/rulesets.schema.json",
  "rulesets": [
    {
      "id": "6194b61a-1bf3-4c02-8b7c-20f782d68324",
      "name": "Complex Ruleset",
      "disabled": false,
      "rules": [
        {
          "id": "6e8t54h6s4e-6erth46sre8th4-d46t8s13t5j1",
          "name": "Rule with complex fact",
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
                    "value": "complexFact",
                    // specify the JSON path to your fact
                    "path": "$.arrayPropName[0].propName"
                  },
                  "operator": "equals",
                  "rhs": {
                    "type": "LITERAL",
                    "value": "MY_SEARCHED_VALUE"
                  }
                }
              ]
            },
            "successElements": [
              // Any action
            ],
            "failureElements": [
              // Any action
            ]
          }
        }
      ]
    }
  ]
}
```
