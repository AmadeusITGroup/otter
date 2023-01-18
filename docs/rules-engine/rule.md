# Rule

A rule is a group of conditions that will output a list of actions after processing. A unique id identifies each rule.   
The default action types and their object structure definitions can be found in [structure definition file](https://github.com/AmadeusITGroup/otter/blob/main/packages/@o3r/rules-engine/src/engine/structure.ts). 
To see more about conditions, have a look at [nested conditions example](./examples/nested-conditions.md). 


It contains at root level the information needed to optimize the reevaluation of this rule :
* inputRuntimeFacts : the input runtime facts the rule is based on
* inputFacts : the facts that are used by the rule
* outputRuntimeFacts : the runtime facts that are updated/set by the rule
This allows to refresh only the needed rule when a fact changes.
In case a fact used in a rule is not part of this inputFacts list it will just be considered undefined.

The following examples contain details about the rule object structure in different contexts.

## Sequential rules
Example:

- the first rule is updating a _runtime (temporary) fact_ used by the second one

```json
  ...
  "rules": [
    {
      "id": "6e8t54h6s4e-6erth46sre8th4-d46t8s13t5j1",
      "name": "the first rule",
      "inputRuntimeFacts": [], // list of runtime fact ids updated by previous rules
      "inputFacts": ["isMobileDevice"], // list of base facts used at rule execution
      "outputRuntimeFacts": ["UI_FACT_2"], // list of runtime facts ids modified by this rule
      "rootElement": {  // Q: TODO can it be smth else?
        "elementType": "RULE_BLOCK", // type of the element, in this case a RULE_BLOCK.
        "blockType": "IF_ELSE", // defines a structure with a condition and a list of success elements plus a list of failure elements
        "condition": { // rule condition object. See `nested-conditions.ts` for object structure details
          "any": [
            {
              "lhs": {
                "type": "FACT",
                "value": "isMobileDevice"
              },
              "operator": "equal",  // see all default operators in [engine operators section](https://github.com/AmadeusITGroup/otter/blob/main/packages/%40o3r/rules-engine/src/engine/operator/operators/index.ts)
              "rhs": {
                "type": "LITERAL",
                "value": true
              }
            }
          ]
        },
        "successElements": [ // list of actions executed in case of condition evaluation as success
          {
            "elementType":"ACTION", // type of the element, in this case an ACTION
            "actionType":"SET_FACT",
            "fact":"UI_FACT_2",
            "value":true
          }
        ],
        "failureElements":[ // list of actions executed in case of condition evaluation as failure
          {
            "elementType":"ACTION",
            "actionType":"SET_FACT",
            "fact":"UI_FACT_2",
            "value":false
          }
        ]
      }
    },
    {
      "id": "6e8t54h6s4e-6erth46sre8th4-d46t8s13t5j2",
      "name": "the second rule",
      "inputRuntimeFacts": ["UI_FACT_2"],
      "inputFacts": [],
      "outputRuntimeFacts": [],
      "rootElement": {
        "elementType": "RULE_BLOCK",
        "blockType": "IF_ELSE",
        "condition": {
          "any": [
            {
              "lhs": {
                "type": "RUNTIME_FACT",
                "value": "UI_FACT_2"
              },
              "operator": "equal",
              "rhs": {
                "type": "LITERAL",
                "value": false
              }
            }
          ]
        },
        "successElements": [
          { // update config for `MyComponent` in case of condition valid output
            "actionType": "UPDATE_CONFIG",
            "elementType": "ACTION",
            "property": "testConfig",
            "library": "@scope/components",
            "component": "MyComponent",
            "value": "value"
          }
        ],
        "failureElements": [
          // Any actions
        ]
      }
    }
  ]
```

## No condition rules
In this case the _successElements_ will always be executed

Example:

```json
  ...
  "rules": [
    {
      "id": "6e8t54h6s4e-6erth46sre8th4-d46t8s13t5j1",
      "name": "the first rule",
      "inputRuntimeFacts": [], // list of runtime fact ids updated by previous rules
      "inputFacts": ["isMobileDevice"], // list of base facts used at rule execution
      "outputRuntimeFacts": ["UI_FACT_2"], // list of runtime facts ids modified by this rule
      "rootElement": {
        "elementType": "RULE_BLOCK", // type of the element, in this case a RULE_BLOCK.
        "blockType": "IF_ELSE", // TODO check if this field still exists
        "successElements": [ // always executed
          {
            "elementType":"ACTION", // type of the element, in this case an ACTION
            "actionType":"SET_FACT",
            "fact":"UI_FACT_2",
            "value":true
          }
        ],
        "failureElements":[ // never executed
          {
            "elementType":"ACTION",
            "actionType":"SET_FACT",
            "fact":"UI_FACT_2",
            "value":false
          }
        ]
      }
    },
    ...
  ]
```
