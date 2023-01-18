# Ruleset

The ruleset is a set of rules that will be processed in the same order as defined in the json.
All the temporary facts defined by a rule in a ruleset will be active only for the latter. It will be cleaned up between 2 ruleset executions.
A unique id identifies each ruleset.

example : 
```json
{
  "id": "e5th46e84-5e4th-54eth65seth46se8th4",
  "name": "the first ruleset",
  "rules": [
    {
      "id": "6e8t54h6s4e-6erth46sre8th4-d46t8s13t5j1",
      "name": "the first rule",
      "inputRuntimeFacts": [],
      "inputFacts": ["isMobileDevice"],
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
              "operator": "equal",
              "rhs": {
                "type": "LITERAL",
                "value": true
              }
            }
          ]
        },
        "successElements": [
        ],
        "failureElements": [
        ]
      }
    },
    {
      "id": "6e8t54h6s4e-6erth46sre8th4-d46t8s13t5j2",
      "name": "the second rule",
      "inputRuntimeFacts": [],
      "inputFacts": ["isMobileDevice"],
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
              "operator": "equal",
              "rhs": {
                "type": "LITERAL",
                "value": true
              }
            }
          ]
        },
        "successElements": [
        ],
        "failureElements": [
        ]
      }
    }
  ]
}
```
