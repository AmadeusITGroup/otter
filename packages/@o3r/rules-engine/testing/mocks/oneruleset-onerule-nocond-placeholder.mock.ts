import type {
  Ruleset,
} from '@o3r/rules-engine';

export const jsonOneRulesetOneRuleNoCondPlaceholder: { ruleSets: Ruleset[] } = {
  ruleSets: [
    {
      id: 'e5th46e84-5e4th-54eth65seth46se8th4',
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
                actionType: 'UPDATE_PLACEHOLDER',
                placeholderId: 'myPlaceholderId',
                value: 'relativePathToMyPlaceholder._LANGUAGE_.json'
              }
            ],
            failureElements: []
          }
        }
      ]
    }
  ]
};
