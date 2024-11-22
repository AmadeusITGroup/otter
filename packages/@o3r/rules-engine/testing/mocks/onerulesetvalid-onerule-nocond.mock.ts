import type {
  Ruleset,
} from '@o3r/rules-engine';

export const jsonOneRulesetValidOneRuleNoCond: { ruleSets: Ruleset[] } = {
  ruleSets: [
    {
      id: 'e5th46e84-5e4th-54eth65seth46se8th1',
      name: 'the first ruleset',
      rules: [
        {
          id: '6e8t54h6s4e-6erth46sre8th4-d46t8s13t5j1',
          name: 'the first rule',
          inputRuntimeFacts: [],
          inputFacts: [],
          outputRuntimeFacts: [],
          rootElement: {
            elementType: 'RULE_BLOCK',
            blockType: 'IF_ELSE',
            successElements: [
              {
                elementType: 'ACTION',
                actionType: 'UPDATE_LOCALISATION',
                key: 'my.ssci.loc.key',
                value: 'my.custom.ssci.loc.key2'
              }
            ],
            failureElements: []
          }
        }
      ]
    },
    {
      id: 'e5th46e84-5e4th-54eth65seth46se8th2',
      name: 'the second ruleset',
      validityRange: {
        to: '2025-07-23T18:25:43.511Z'
      },
      linkedComponent: {
        library: '@otter/comps',
        name: 'TestComponent'
      },
      rules: [
        {
          id: '6e8t54h6s4e-6erth46sre8th4-d46t8s13t5j1',
          name: 'the first rule',
          inputRuntimeFacts: [],
          inputFacts: [],
          outputRuntimeFacts: [],
          rootElement: {
            elementType: 'RULE_BLOCK',
            blockType: 'IF_ELSE',
            successElements: [
              {
                elementType: 'ACTION',
                actionType: 'UPDATE_LOCALISATION',
                key: 'my.ssci.loc.key',
                value: 'my.custom.ssci.loc.key3'
              }
            ],
            failureElements: []
          }
        }
      ]
    },
    {
      id: 'e5th46e84-5e4th-54eth65seth46se8th3',
      name: 'the third ruleset',
      validityRange: {
        from: '2100-07-23T18:25:43.511Z'
      },
      linkedComponent: {
        library: '@otter/comps',
        name: 'TestComponent2'
      },
      rules: [
        {
          id: '6e8t54h6s4e-6erth46sre8th4-d46t8s13t5j1',
          name: 'the first rule',
          inputRuntimeFacts: [],
          inputFacts: [],
          outputRuntimeFacts: [],
          rootElement: {
            elementType: 'RULE_BLOCK',
            blockType: 'IF_ELSE',
            successElements: [
              {
                elementType: 'ACTION',
                actionType: 'UPDATE_LOCALISATION',
                key: 'my.ssci.loc.key',
                value: 'my.custom.ssci.loc.key2'
              }
            ],
            failureElements: []
          }
        }
      ]
    },
    {
      id: 'e5th46e84-5e4th-54eth65seth46se8th4',
      name: 'the fourth ruleset',
      validityRange: {
        to: '2021-07-23T18:25:43.511Z'
      },
      rules: [
        {
          id: '6e8t54h6s4e-6erth46sre8th4-d46t8s13t5j1',
          name: 'the first rule',
          inputRuntimeFacts: [],
          inputFacts: [],
          outputRuntimeFacts: [],
          rootElement: {
            elementType: 'RULE_BLOCK',
            blockType: 'IF_ELSE',
            successElements: [
              {
                elementType: 'ACTION',
                actionType: 'UPDATE_LOCALISATION',
                key: 'my.ssci.loc.key',
                value: 'my.custom.ssci.loc.key2'
              }
            ],
            failureElements: []
          }
        }
      ]
    }
  ]
};
