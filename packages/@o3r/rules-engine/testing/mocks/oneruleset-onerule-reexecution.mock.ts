/* eslint-disable id-denylist -- `any` is a conditional keyword enforced by the rule interface */
import type {
  Ruleset,
} from '@o3r/rules-engine';

export const jsonOneRulesetOneRuleReexecution: { ruleSets: Ruleset[] } = {
  ruleSets: [
    {
      id: 'e326428a-8b2e-4615-9c33-ee3e9674e81a',
      name: 'test ruleset',
      rules: [
        {
          id: '5e7c37c9-b483-4742-86f5-bdae9b155f09',
          name: 'init rule',
          outputRuntimeFacts: ['CMS_myFact'],
          inputFacts: ['foieGrasPrice', 'pageUrl'],
          inputRuntimeFacts: [],
          rootElement: {
            elementType: 'RULE_BLOCK',
            blockType: 'IF_ELSE',
            successElements: [
              {
                elementType: 'ACTION',
                actionType: 'SET_FACT',
                fact: 'CMS_myFact',
                value: false
              },
              {
                elementType: 'RULE_BLOCK',
                blockType: 'IF_ELSE',
                condition: {
                  any: [
                    {
                      lhs: {
                        type: 'FACT', value: 'foieGrasPrice'
                      },
                      rhs: {
                        type: 'LITERAL', value: '50'
                      },
                      operator: 'equals'
                    },
                    {
                      lhs: {
                        type: 'FACT',
                        value: 'pageUrl'
                      },
                      rhs: {
                        type: 'LITERAL',
                        value: 'upsell'
                      },
                      operator: 'stringContains'
                    }]
                },
                successElements: [
                  {
                    elementType: 'ACTION',
                    actionType: 'SET_FACT',
                    fact: 'CMS_myFact',
                    value: true
                  }
                ],
                failureElements: []
              }],
            failureElements: []
          }
        }, {
          id: '9d6c1b83-9350-4ab5-beb1-3f1782ab334b',
          name: 'best rule 2',
          outputRuntimeFacts: [],
          inputFacts: [],
          inputRuntimeFacts: ['CMS_myFact'],
          rootElement: {
            elementType: 'RULE_BLOCK',
            blockType: 'IF_ELSE',
            condition: {
              all: [{
                lhs: {
                  type: 'RUNTIME_FACT',
                  value: 'CMS_myFact'
                },
                rhs: {
                  type: 'LITERAL',
                  value: true
                },
                operator: 'equals'
              }]
            },
            successElements: [
              {
                elementType: 'ACTION',
                actionType: 'UPDATE_ASSET',
                asset: 'assets-demo-app/img/places/islands.jpg',
                value: 'assets-demo-app/img/places/airplane.jpg'
              }],
            failureElements: []
          }
        }
      ]
    }
  ]
};
