```typescript
import {Operator, RulesEngine, Ruleset} from '@o3r/rules-engine';

export const basicRuleExample: {ruleSets: Ruleset[]} = {
  'ruleSets' : [
    {
      'id': 'e5th46e84-5e4th-54eth65seth46se8th4',
      'name': 'the first ruleset',
      'rules': [
        {
          'id': '6e8t54h6s4e-6erth46sre8th4-d46t8s13t5j1',
          'name': 'the only rule',
          'inputRuntimeFacts': [],
          'inputFacts': ['isMobileDevice'],
          'outputRuntimeFacts': [],
          'rootElement': {
            'elementType': 'RULE_BLOCK',
            'blockType': 'IF_ELSE',
            'condition': {
              'any': [
                {
                  'lhs': {
                    'type': 'FACT',
                    'value': 'isMobileDevice'
                  },
                  'operator': 'booleanStartWithOperator',
                  'rhs': {
                    'type': 'LITERAL',
                    'value': true
                  }
                }
              ]
            },
            'successElements': [
              // Any action
            ],
            'failureElements': [
              // Any action
            ]
          }
        }
      ]
    },
  ]
}

const booleanStartWithOperator: Operator<boolean, string> = {
  // validate left operand
  validateLhs: (value) => typeof value == 'boolean',
  // validate right operand
  validateRhs: (value) => typeof value == 'string',
  evaluator: (lhs, rhs) => lhs.toString().startsWith(rhs),
  name: 'booleanStartWith'
}

/** Rule Engine Instance */
const engine = new RulesEngine({
  // ...
  operators: [
    booleanStartWithOperator
  ]
});

/** Stream of the engin result */
const results$ = engine.getEventStream();

// Will emit the display action after the fact has changed to pass the condition (2s)
results$.subscribe((actions) => {
  console.info(actions);
});
```
