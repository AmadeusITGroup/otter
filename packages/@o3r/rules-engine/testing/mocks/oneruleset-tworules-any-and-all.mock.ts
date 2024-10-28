import type {
  Ruleset
} from '@o3r/rules-engine';

export const jsonOneRulesetTwoRulesAnyAndAll: { ruleSets: Ruleset[] } = {
  'ruleSets': [
    {
      'id': 'e5th46e84-5e4th-54eth65seth46se8th8',
      'name': 'ALL and ANY ruleset',
      'rules': [
        {
          'id': '6e8t54h6s4e-6erth46sre8th4-d46t8s13t5j1',
          'name': 'the first rule with ALL',
          'inputRuntimeFacts': [],
          'inputFacts': ['foieGrasPrice'],
          'outputRuntimeFacts': [],
          'rootElement': {
            'elementType': 'RULE_BLOCK',
            'blockType': 'IF_ELSE',
            'condition': {
              'all': [
                {
                  'lhs': {
                    'type': 'FACT',
                    'value': 'foieGrasPrice'
                  },
                  'operator': 'isDefined'
                },
                {
                  'lhs': {
                    'type': 'FACT',
                    'value': 'foieGrasPrice'
                  },
                  'rhs': {
                    'type': 'LITERAL',
                    'value': 0
                  },
                  'operator': 'greaterThan'
                }
              ]
            },
            'successElements': [
              {
                'elementType': 'ACTION',
                'actionType': 'SET_FACT',
                'fact': 'andOutput',
                'value': true
              }
            ],
            'failureElements': [
              {
                'elementType': 'ACTION',
                'actionType': 'SET_FACT',
                'fact': 'andOutput',
                'value': false
              }
            ]
          }
        },

        {
          'id': '6e8t54h6s4e-6erth46sre8th4-d46t8s13t5j2',
          'name': 'the second rule with ANY',
          'inputRuntimeFacts': [],
          'inputFacts': ['foieGrasPrice'],
          'outputRuntimeFacts': [],
          'rootElement': {
            'elementType': 'RULE_BLOCK',
            'blockType': 'IF_ELSE',
            'condition': {
              'any': [
                {
                  'lhs': {
                    'type': 'FACT',
                    'value': 'foieGrasPrice'
                  },
                  'operator': 'isNotDefined'
                },
                {
                  'lhs': {
                    'type': 'FACT',
                    'value': 'foieGrasPrice'
                  },
                  'rhs': {
                    'type': 'LITERAL',
                    'value': 0
                  },
                  'operator': 'greaterThan'
                }
              ]
            },
            'successElements': [
              {
                'elementType': 'ACTION',
                'actionType': 'SET_FACT',
                'fact': 'anyOutput',
                'value': true
              }
            ],
            'failureElements': [
              {
                'elementType': 'ACTION',
                'actionType': 'SET_FACT',
                'fact': 'anyOutput',
                'value': false
              }
            ]
          }
        }
      ]
    }
  ]
};
