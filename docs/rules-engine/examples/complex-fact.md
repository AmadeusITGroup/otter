```typescript
import {Ruleset} from '@o3r/rules-engine';

export const complexFactsExample: {ruleSets: Ruleset[]} = {
  'ruleSets' : [
    {
      'id': 'e5th46e84-5e4th-54eth65seth46se8th4',
      'name': 'the first ruleset',
      'rules': [
        {
          'id': '6e8t54h6s4e-6erth46sre8th4-d46t8s13t5j1',
          'name': 'the only rule',
          'inputRuntimeFacts': [],
          'inputFacts': ['example'],
          'outputRuntimeFacts': [],
          'rootElement': {
            'elementType': 'RULE_BLOCK',
            'blockType': 'IF_ELSE',
            'condition': {
              'any': [
                {
                  'lhs': {
                    'type': 'FACT',
                    'value': 'cart',
                    'path': '$.arrayPropName[0].propName'
                  },
                  'operator': 'equals',
                  'rhs': {
                    'type': 'LITERAL',
                    'value': 'NCE'
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
