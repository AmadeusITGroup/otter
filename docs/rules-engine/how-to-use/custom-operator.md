# Rules engine - Custom operators

While the Otter framework already exposes a set of generic [operators](https://github.com/AmadeusITGroup/otter/tree/main/packages/%40o3r/rules-engine/src/engine/operator/operators), 
you might need additional ones that will better fit your use cases.

Let's see how to integrate a whole new operator `isTruthy` that check if a string or a boolean is equal to `true` (boolean)
or if it is equal to the "TRUE" or "TRUTHY" string. The operator is not case-sensitive.

## Implement your operator

First, generate the operator with the command `ng g operator [name] --path=[path-to-operators-folder]`.
The Otter CLI will generate the operator skeleton for you. You are now free to fill it with your own logic:

```typescript
const isTruthy: Operator<boolean | string> = {
  // validate left operand
  validateLhs: (value) => typeof value == 'boolean' || typeof value == 'string',
  // validate right operand
  evaluator: (lhs) => {
    if (typeof lhs === 'boolean') {
      return lhs;
    }
    return ["true", "truthy"].indexOf(lhs.toLowerCase()) > -1;
  },
  name: 'isTruthy'
}
```

Make sure to register your operator in your engine to make it available.

```typescript
import {RulesEngineRunnerService} from "@o3r/rules-engine";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {

  constructor(rulesEngine: RulesEngineRunnerService) {
    rulesEngine.upsertOperators([isTruthy])
  }
}
```

It is now ready to be used in your Rulesets.

> [!NOTE]
> If you administrate your rules in a dedicated UI (CMS or admin UI), you will need to extract your operator metadata.
> Check out the [metadata documentation](./industrialize-ruleset-generation.md) to see how to do it.

## Ruleset

```json5
{
  "schema": "https://raw.githubusercontent.com/AmadeusITGroup/otter/main/packages/%40o3r/rules-engine/schemas/rulesets.schema.json",
  "rulesets": [
    {
      "id": "6194b61a-1bf3-4c02-8b7c-20f782d68324",
      "name": "My Ruleset",
      "disabled": false,
      "rules": [
        {
          "id": "5467e501-b9ff-414f-8026-56885d0d7a4b",
          "name": "Check if input is Truthy",
          "disabled": false,
          "outputRuntimeFacts": [],
          "inputRuntimeFacts": [],
          "rootElement": {
            "elementType": "RULE_BLOCK",
            "blockType": "IF_ELSE",
            "condition": {
              "any": [
                {
                  "lhs": {
                    "type": "FACT",
                    "value": "userInput"
                  },
                  "operator": "isTruthy",
                }
              ]
            },
            "successElements": [
              // Do anything
            ]
          }
        }
      ]
    }
  ]
}
```
