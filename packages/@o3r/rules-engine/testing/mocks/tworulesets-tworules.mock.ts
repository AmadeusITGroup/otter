/* eslint-disable id-denylist -- `any` is a conditional keyword enforced by the rule interface */
import type {
  Ruleset,
} from '@o3r/rules-engine';

export const jsonTwoRulesetTwoRules: { ruleSets: Ruleset[] } = {
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
            condition: {
              any: [
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
                }
              ]
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
                actionType: 'UPDATE_CONFIG',
                library: '@otter/library',
                component: 'TheConfig',
                property: 'theproperty',
                value: [
                  'raviole',
                  'truelle'
                ]
              },
              {
                elementType: 'ACTION',
                actionType: 'UPDATE_ASSET',
                asset: 'youpi/pouet/default.jpg',
                value: 'custom/assets/custom.png'
              },
              {
                elementType: 'ACTION',
                actionType: 'UPDATE_LOCALISATION',
                key: 'my.ssci.loc.key',
                value: 'my.custom.ssci.loc.key2'
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
    },
    {
      id: 'e5th46e84-5e4th-54eth65seth46se8th1',
      name: 'the second ruleset',
      rules: [
        {
          id: '6e8t54h6s4e-6erth46sre8th4-d46t8s13t5j3',
          name: 'the first rule',
          inputRuntimeFacts: [],
          outputRuntimeFacts: [
            'UI_FACT_3',
            'UI_FACT_2',
            'UI_FACT_4',
            'UI_FACT_5'
          ],
          rootElement: {
            elementType: 'RULE_BLOCK',
            blockType: 'IF_ELSE',
            condition: {
              not: {
                any: [
                  {
                    lhs: {
                      type: 'FACT',
                      value: 'isMobileDevice'
                    },
                    operator: 'equals',
                    rhs: {
                      type: 'LITERAL',
                      value: false
                    }
                  }
                ]
              }
            },
            successElements: [
              {
                elementType: 'ACTION',
                actionType: 'SET_FACT',
                fact: 'UI_FACT_2',
                value: true
              },
              {
                elementType: 'RULE_BLOCK',
                blockType: 'IF_ELSE',
                condition: {
                  any: [
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
                    }
                  ]
                },
                successElements: [
                  {
                    elementType: 'ACTION',
                    actionType: 'SET_FACT',
                    fact: 'UI_FACT_3',
                    value: true
                  }
                ],
                failureElements: [
                  {
                    elementType: 'ACTION',
                    actionType: 'SET_FACT',
                    fact: 'UI_FACT_3',
                    value: false
                  }
                ]
              },
              {
                elementType: 'ACTION',
                actionType: 'SET_FACT',
                fact: 'UI_FACT_4',
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
          id: '6e8t54h6s4e-6erth46sre8th4-d46t8s13t5j4',
          name: 'the second rule',
          inputRuntimeFacts: [],
          outputRuntimeFacts: [],
          rootElement: {
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
                key: 'my.ssci.loc.key2',
                value: 'my.custom.ssci.loc.key3'
              }
            ],
            failureElements: [
              {
                elementType: 'ACTION',
                actionType: 'UPDATE_LOCALISATION',
                key: 'my.ssci.loc.key4',
                value: 'my.custom.ssci.loc.key5'
              }
            ]
          }
        }
      ]
    }
  ]
};
