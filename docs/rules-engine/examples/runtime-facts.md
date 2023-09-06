```typescript
/** simple rule with condition based on inner fact */
import {Ruleset} from '@o3r/rules-engine';

// Using isMobileDevice fact as an example
export const runtimeFactExample: {ruleSets: Ruleset[]} = {
  'ruleSets' : [
    {
      'id': 'e5th46e84-5e4th-54eth65seth46se8th4',
      'name': 'the first ruleset',
      'rules': [
        {
          'id': '6e8t54h6s4e-6erth46sre8th4-d46t8s13t5j1',
          'name': 'the first rule',
          'inputRuntimeFacts': [],
          'inputFacts': ['isMobileDevice'],
          'outputRuntimeFacts': [
            'UI_FACT_2'
          ],
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
                  'operator': 'equals',
                  'rhs': {
                    'type': 'LITERAL',
                    'value': true
                  }
                }
              ]
            },
            'successElements': [
              {
                'elementType': 'ACTION',
                'actionType': 'SET_FACT',
                'fact': 'UI_FACT_2',
                'value': true
              }
            ],
            'failureElements': [
              {
                'elementType': 'ACTION',
                'actionType': 'SET_FACT',
                'fact': 'UI_FACT_2',
                'value': false
              }
            ]
          }
        },
        {
          'id': '6e8t54h6s4e-6erth46sre8th4-d46t8s13t5j2',
          'name': 'the second rule',
          'inputRuntimeFacts': ['UI_FACT_2'],
          'inputFacts': [],
          'outputRuntimeFacts': [],
          'rootElement': {
            'elementType': 'RULE_BLOCK',
            'blockType': 'IF_ELSE',
            'condition': {
              'any': [
                {
                  'lhs': {
                    'type': 'RUNTIME_FACT',
                    'value': 'UI_FACT_2'
                  },
                  'operator': 'equals',
                  'rhs': {
                    'type': 'LITERAL',
                    'value': false
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
```
