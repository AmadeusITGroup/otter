import type {
  Ruleset,
} from '@o3r/rules-engine';

export const jsonTwoRulesetsBothOnDemand: { rulesets: Ruleset[] } = {
  rulesets: [
    {
      id: 'e5th46e84-5e4th-54eth65seth46se8Linked',
      name: '2 linked component ruleset',
      linkedComponents: {
        or: [
          {
            library: '@otter/demo-app-components',
            name: 'o3r-calendar-per-bound-cont'
          },
          {
            library: '@otter/demo-app-components',
            name: 'o3r-calendar-per-bound-cont-2'
          }
        ]
      },
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
      id: 'e5th46e84-5e4th-54eth65seth46Default',
      name: 'the first ruleset',
      linkedComponents: {
        or: [{
          library: '@otter/demo-app-components',
          name: 'o3r-calendar-per-bound-cont'
        }]
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
        }
      ]
    }
  ]
};
