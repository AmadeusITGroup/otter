/* eslint-disable id-denylist -- `any` is a conditional keyword enforced by the rule interface */
import type {
  Ruleset,
} from '@o3r/rules-engine';

export const jsonOneRulesetTwoNestedRules: { ruleSets: Ruleset[] } = {
  ruleSets: [
    {
      id: 'e5th46e84-5e4th-54eth65seth46se8th4',
      name: 'the first ruleset',
      rules: [
        {
          id: '6e8t54h6s4e-6erth46sre8th4-d46t8s13t5j1',
          name: 'the first rule',
          inputRuntimeFacts: [],
          outputRuntimeFacts: [
            'UI_FACT_2'
          ],
          rootElement: {
            elementType: 'RULE_BLOCK',
            blockType: 'IF_ELSE',
            condition:
              {
                lhs: {
                  type: 'FACT',
                  value: 'isMobileDevice'
                },
                operator: 'equals',
                rhs: {
                  type: 'LITERAL',
                  value: true
                }
              },
            successElements: [
              {
                elementType: 'ACTION',
                actionType: 'SET_FACT',
                fact: 'UI_FACT_2',
                value: true
              }
            ],
            failureElements: [
              {
                elementType: 'ACTION',
                actionType: 'SET_FACT',
                fact: 'UI_FACT_2',
                value: false
              }
            ]
          }
        },
        {
          id: '6e8t54h6s4e-6erth46sre8th4-d46t8s13t5j2',
          name: 'the second rule',
          inputRuntimeFacts: ['UI_FACT_2'],
          outputRuntimeFacts: [],
          rootElement: {
            elementType: 'RULE_BLOCK',
            blockType: 'IF_ELSE',
            condition: {
              any: [
                {
                  lhs: {
                    type: 'RUNTIME_FACT',
                    value: 'UI_FACT_2'
                  },
                  operator: 'equals',
                  rhs: {
                    type: 'LITERAL',
                    value: false
                  }
                }
              ]
            },
            successElements: [
              {
                elementType: 'ACTION',
                actionType: 'UPDATE_LOCALISATION',
                key: 'my.loc.key2.success',
                value: 'my.loc.value2.success'
              },
              {
                elementType: 'ACTION',
                actionType: 'UPDATE_LOCALISATION',
                key: 'my.loc.key3.success',
                value: 'my.loc.value3.success'
              },
              {
                elementType: 'RULE_BLOCK',
                blockType: 'IF_ELSE',
                condition: {
                  any: [
                    {
                      lhs: {
                        type: 'FACT',
                        value: 'cart',
                        path: '$.xmasHampers[0].hamperItems[1].id'
                      },
                      operator: 'equals',
                      rhs: {
                        type: 'LITERAL',
                        value: 'foieGras'
                      }
                    }
                  ]
                },
                successElements: [
                  {
                    elementType: 'ACTION',
                    actionType: 'UPDATE_LOCALISATION',
                    key: 'my.loc.key4.success',
                    value: 'my.loc.value4.success'
                  }
                ],
                failureElements: [
                  {
                    elementType: 'ACTION',
                    actionType: 'UPDATE_LOCALISATION',
                    key: 'my.loc.key5.failure',
                    value: 'my.loc.value5.failure'
                  }
                ]
              },
              {
                elementType: 'ACTION',
                actionType: 'UPDATE_LOCALISATION',
                key: 'my.loc.key6.success',
                value: 'my.loc.value6.success'
              }
            ],
            failureElements: [
              {
                elementType: 'ACTION',
                actionType: 'SET_FACT',
                fact: 'UI_FACT_2',
                value: false
              }
            ]
          }
        }
      ]
    }
  ]
};
