/* eslint-disable id-denylist -- `any` is a conditional keyword enforced by the rule interface */
import type {
  Ruleset,
} from '@o3r/rules-engine';

export const jsonTwoRulesetTwoRulesNoContext: { ruleSets: Ruleset[] } = {
  ruleSets: [
    {
      id: 'e5th46e84-5e4th-54eth65seth46se8th4',
      name: 'the first ruleset',
      rules: [
        {
          id: '6e8t54h6s4e-6erth46sre8th4-d46t8s13t5j1',
          name: 'the first rule',
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
                actionType: 'UPDATE_LOCALISATION',
                key: 'my.loc.key.success',
                value: 'my.loc.value.success'
              }
            ],
            failureElements: [
              {
                elementType: 'ACTION',
                actionType: 'UPDATE_LOCALISATION',
                key: 'my.loc.key.failure',
                value: 'my.loc.value.failure'
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
                key: 'my.loc.key2.success',
                value: 'my.loc.value2.success'
              }
            ],
            failureElements: [
              {
                elementType: 'ACTION',
                actionType: 'UPDATE_LOCALISATION',
                key: 'my.loc.key2.failure',
                value: 'my.loc.value2.failure'
              }
            ]
          }
        }
      ]
    }
  ]
};
