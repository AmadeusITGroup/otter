import {
  Ruleset,
} from '../../src/engine/structure';

export const rulesetsObj: { rulesets: Ruleset[] } = {
  rulesets: [
    {
      id: 'e5th46e84-5e4th-54eth65seth46se8th2',
      name: 'ruleset zero',
      rules: [
        {
          id: '6e8t54h6s4e-6erth46sre8th4-d46t8s13t5j9',
          name: 'rule zero',
          inputRuntimeFacts: [],
          outputRuntimeFacts: [],
          rootElement: {
            elementType: 'RULE_BLOCK',
            blockType: 'IF_ELSE',
            successElements: [
              {
                elementType: 'ACTION',
                actionType: 'UPDATE_CONFIG',
                component: 'o3r-calendar-per-bound-cont',
                library: '@otter/demo-app-components',
                property: 'numberOfDateDisplayed',
                value: 4
              }
            ],
            failureElements: []
          }
        }
      ]
    },
    {
      id: 'e5th46e84-5e4th-54eth65seth46se8th4',
      name: 'first ruleset',
      validityRange: {
        from: '09/01/2021',
        to: '11/01/2023'
      },
      rules: [
        {
          id: '6e8t54h6s4e-6erth46sre8th4-d46t8s13t5j0',
          name: 'rule zero',
          inputRuntimeFacts: [],
          outputRuntimeFacts: [],
          rootElement: {
            elementType: 'RULE_BLOCK',
            blockType: 'IF_ELSE',
            condition: {
              all: [
                {
                  lhs: {
                    type: 'FACT',
                    value: 'destinationLocationCode'
                  },
                  operator: 'equals',
                  rhs: {
                    type: 'LITERAL',
                    value: 'LON'
                  }
                },
                {
                  lhs: {
                    type: 'FACT',
                    value: 'pageUrl'
                  },
                  operator: 'stringContains',
                  rhs: {
                    type: 'LITERAL',
                    value: 'upsell'
                  }
                }
              ]
            },
            successElements: [
              {
                elementType: 'ACTION',
                actionType: 'UPDATE_ASSET',
                asset: 'assets-demo-app/img/places/islands.jpg',
                value: 'assets-demo-app/img/places/airport.jpg'
              },
              {
                elementType: 'ACTION',
                actionType: 'UPDATE_LOCALISATION',
                key: 'o3r-upsell-page.header',
                value: 'o3r-upsell-page.header.replace'
              },
              {
                elementType: 'ACTION',
                actionType: 'UPDATE_CONFIG',
                component: 'o3r-simple-header-pres',
                library: '@otter/demo-components',
                property: 'showMotto',
                value: false
              },
              {
                elementType: 'ACTION',
                actionType: 'UPDATE_CONFIG',
                component: 'o3r-simple-header-pres',
                library: '@otter/demo-components',
                property: 'showLanguageSelector',
                value: false
              }
            ],
            failureElements: [
            ]
          }
        },
        {
          id: '6e8t54h6s4e-6erth46sre8th4-d46t8s13t5j9',
          name: 'rule one',
          inputRuntimeFacts: [],
          outputRuntimeFacts: ['CMS_myFact'],
          rootElement: {
            elementType: 'RULE_BLOCK',
            blockType: 'IF_ELSE',
            condition: {
              lhs: {
                type: 'FACT',
                value: 'isMobileDevice'
              },
              operator: 'equals',
              rhs: {
                type: 'LITERAL',
                value: false
              }
            },
            successElements: [
              {
                elementType: 'ACTION',
                actionType: 'SET_FACT',
                fact: 'CMS_myFact',
                value: false
              },
              {
                elementType: 'ACTION',
                actionType: 'UPDATE_CONFIG',
                component: 'o3r-simple-header-pres',
                library: '@otter/demo-components',
                property: 'showLanguageSelector',
                value: false
              }
            ],
            failureElements: []
          }
        }
      ]
    }
  ]
};
