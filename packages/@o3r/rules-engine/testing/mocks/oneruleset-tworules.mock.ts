import type { Ruleset } from '@o3r/rules-engine';

// TODO Add a second ruleset in IT test
export const jsonOneRulesetTwoRules: { ruleSets: Ruleset[] } = {
  'ruleSets': [
    {
      'id': 'e5th46e84-5e4th-54eth65seth46se8th4',
      'name': 'the first ruleset',
      'rules': [
        {
          'id': '6e8t54h6s4e-6erth46sre8th4-d46t8s13t5j1',
          'name': 'the first rule',
          'inputRuntimeFacts': [],
          'inputFacts': ['aNumber'],
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
                    'value': 'aNumber'
                  },
                  'operator': 'lessOrEqual',
                  'rhs': {
                    'type': 'LITERAL',
                    'value': 5
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
              },
              {
                'elementType': 'ACTION',
                'actionType': 'UPDATE_LOCALISATION',
                'key': 'first.rule.success.loc.key',
                'value': 'first.rule.success.loc.key2'
              }
            ],
            'failureElements': [
              {
                'elementType': 'ACTION',
                'actionType': 'SET_FACT',
                'fact': 'UI_FACT_2',
                'value': false
              },
              {
                'elementType': 'ACTION',
                'actionType': 'UPDATE_LOCALISATION',
                'key': 'first.rule.failure.loc.key',
                'value': 'first.rule.failure.loc.key2'
              }
            ]
          }
        },
        {
          'id': '6e8t54h6s4e-6erth46sre8th4-d46t8s13t5j2',
          'name': 'the second rule',
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
                  'operator': 'equals',
                  'rhs': {
                    'type': 'LITERAL',
                    'value': '30'
                  }
                }
              ]
            },
            'successElements': [
              {
                'elementType': 'ACTION',
                'actionType': 'UPDATE_LOCALISATION',
                'key': 'second.rule.success.loc.key',
                'value': 'second.rule.success.loc.key2'
              }
            ],
            'failureElements': [
              {
                'elementType': 'ACTION',
                'actionType': 'UPDATE_LOCALISATION',
                'key': 'second.rule.failure.loc.key',
                'value': 'second.rule.failure.loc.key2'
              }
            ]
          }
        }
      ]
    },
    {
      'id': 'e5th46e84-5e4th-54eth65seth46se8',
      'name': 'the first ruleset',
      'rules': [
        {
          'id': '6e8t54h6s4e-6erth46sre8th4-d46t8s13t5j1',
          'name': 'the first rule',
          'inputRuntimeFacts': [],
          'inputFacts': [],
          'outputRuntimeFacts': [],
          'rootElement': {
            'elementType': 'RULE_BLOCK',
            'blockType': 'IF_ELSE',
            'successElements': [
              {
                'elementType': 'ACTION',
                'actionType': 'UPDATE_LOCALISATION',
                'key': 'my.ssci.loc.key',
                'value': 'my.custom.ssci.loc.key2'
              }
            ],
            'failureElements': []
          }
        }
      ]
    }
  ]
};
