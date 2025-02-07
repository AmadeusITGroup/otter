import {
  RuleEvaluation,
  RuleEvaluationOutput,
} from '../engine.interface';
import {
  ActionBlock,
  Rule,
} from '../structure';
import {
  flagCachedRules,
  handleRuleEvaluationDebug,
  retrieveRulesetTriggers,
} from './helpers';

const currentEvaluationsOutput = [
  {
    actions: [],
    evaluation: {
      // eslint-disable-next-line unicorn/numeric-separators-style -- timestamp
      timestamp: 1639037495870,
      outputActions: [],
      id: 'first ruleset - rule zero',
      triggers: {
        '6e8t54h6s4e-6erth46sre8th4-d46t8s13t5j0': {
          destinationLocationCode: {
            factName: 'destinationLocationCode',
            newValue: 'LON'
          }
        }
      },
      temporaryFacts: {},
      rule: {
        id: '6e8t54h6s4e-6erth46sre8th4-d46t8s13t5j0',
        name: 'rule zero'
      }
    }
  },
  {
    actions: [
      {
        elementType: 'ACTION',
        actionType: 'UPDATE_CONFIG',
        component: 'o3r-simple-header-pres',
        library: '@otter/demo-components',
        property: 'showLanguageSelector',
        value: false
      }
    ],
    evaluation: {
      // eslint-disable-next-line unicorn/numeric-separators-style -- timestamp
      timestamp: 1639033679719,
      outputActions: [
        {
          elementType: 'ACTION',
          actionType: 'UPDATE_CONFIG',
          component: 'o3r-simple-header-pres',
          library: '@otter/demo-components',
          property: 'showLanguageSelector',
          value: false
        }
      ],
      id: 'first ruleset - rule one',
      triggers: {
        '6e8t54h6s4e-6erth46sre8th4-d46t8s13t5j9': {
          isMobileDevice: {
            factName: 'isMobileDevice',
            newValue: false
          }
        }
      },
      temporaryFacts: {
        CMS_myFact: false
      },
      rule: {
        id: '6e8t54h6s4e-6erth46sre8th4-d46t8s13t5j9',
        name: 'rule one'
      }
    }
  }
] as RuleEvaluationOutput[];

const prevEvaluationsOutput = [
  {
    actions: [],
    evaluation: {
      // eslint-disable-next-line unicorn/numeric-separators-style -- timestamp
      timestamp: 1639033680955,
      outputActions: [],
      id: 'first ruleset - rule zero',
      triggers: {
        '6e8t54h6s4e-6erth46sre8th4-d46t8s13t5j0': {
          pageUrl: {
            factName: 'pageUrl',
            newValue: '/search'
          }
        }
      },
      temporaryFacts: {},
      rule: {
        id: '6e8t54h6s4e-6erth46sre8th4-d46t8s13t5j0',
        name: 'rule zero'
      }
    }
  },
  {
    actions: [
      {
        elementType: 'ACTION',
        actionType: 'UPDATE_CONFIG',
        component: 'o3r-simple-header-pres',
        library: '@otter/demo-components',
        property: 'showLanguageSelector',
        value: false
      }
    ],
    evaluation: {
      // eslint-disable-next-line unicorn/numeric-separators-style -- timestamp
      timestamp: 1639033679719,
      outputActions: [
        {
          elementType: 'ACTION',
          actionType: 'UPDATE_CONFIG',
          component: 'o3r-simple-header-pres',
          library: '@otter/demo-components',
          property: 'showLanguageSelector',
          value: false
        }
      ],
      id: 'first ruleset - rule one',
      triggers: {
        '6e8t54h6s4e-6erth46sre8th4-d46t8s13t5j9': {
          isMobileDevice: {
            factName: 'isMobileDevice',
            newValue: false
          }
        }
      },
      temporaryFacts: {
        CMS_myFact: false
      },
      rule: {
        id: '6e8t54h6s4e-6erth46sre8th4-d46t8s13t5j9',
        name: 'rule one'
      }
    }
  }
] as RuleEvaluationOutput[];

const rulesEvaluations = [
  {
    timestamp: 1_639_040_241_950,
    outputActions: [],
    id: 'first ruleset - rule zero',
    triggers: {
      '6e8t54h6s4e-6erth46sre8th4-d46t8s13t5j0': {
        destinationLocationCode: {
          factName: 'destinationLocationCode',
          newValue: 'LON'
        }
      }
    },
    temporaryFacts: {},
    rule: {
      id: '6e8t54h6s4e-6erth46sre8th4-d46t8s13t5j0',
      name: 'rule zero'
    }
  },
  {
    timestamp: 1_639_040_201_253,
    outputActions: [
      {
        elementType: 'ACTION',
        actionType: 'UPDATE_CONFIG',
        component: 'o3r-simple-header-pres',
        library: '@otter/demo-components',
        property: 'showLanguageSelector',
        value: false
      }
    ],
    id: 'first ruleset - rule one',
    triggers: {
      '6e8t54h6s4e-6erth46sre8th4-d46t8s13t5j9': {
        isMobileDevice: {
          factName: 'isMobileDevice',
          newValue: false
        }
      }
    },
    temporaryFacts: {
      CMS_myFact: false
    },
    rule: {
      id: '6e8t54h6s4e-6erth46sre8th4-d46t8s13t5j9',
      name: 'rule one'
    }
  }
] as RuleEvaluation[];

const rule = {
  id: '6e8t54h6s4e-6erth46sre8th4-d46t8s13t5j9',
  name: 'rule one',
  inputRuntimeFacts: [],
  inputFacts: [
    'isMobileDevice'
  ],
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
} as Rule;

describe('Rules engine debug helpers', () => {
  it('retrieveRulesetTriggers should remove triggers from old evaluation', () => {
    const rulesetTriggers = retrieveRulesetTriggers(currentEvaluationsOutput, prevEvaluationsOutput);
    const expectedTriggerId = Object.keys(currentEvaluationsOutput[0].evaluation.triggers)[0];
    const trigerIdToRemove = Object.keys(currentEvaluationsOutput[1].evaluation.triggers)[0];

    expect(Object.keys(rulesetTriggers).length).toBe(1);
    expect(rulesetTriggers[expectedTriggerId].destinationLocationCode).toBeDefined();
    expect(rulesetTriggers[trigerIdToRemove]).not.toBeDefined();
  });

  it('retrieveRulesetTriggers should keep all triggers from current if previous evaluation is undefined', () => {
    const rulesetTriggers = retrieveRulesetTriggers(currentEvaluationsOutput, undefined);

    expect(Object.keys(rulesetTriggers).length).toBe(2);
  });

  it('flagCachedRules should add cached property for an old rule evaluation', () => {
    const newEvaluationTriggerId = Object.keys(currentEvaluationsOutput[0].evaluation.triggers)[0];
    const rulesEvaluationsUpdated = flagCachedRules(rulesEvaluations, { [newEvaluationTriggerId]: currentEvaluationsOutput[0].evaluation.triggers[newEvaluationTriggerId] });

    expect(rulesEvaluationsUpdated[0].cached).not.toBeDefined();
    expect(rulesEvaluationsUpdated[1].cached).toBe(true);
  });

  it('handleRuleEvaluationDebug should create a rule evaluation object', () => {
    const outputAction = {
      elementType: 'ACTION',
      actionType: 'UPDATE_CONFIG',
      component: 'o3r-simple-header-pres',
      library: '@otter/demo-components',
      property: 'showLanguageSelector',
      value: false
    } as ActionBlock;
    const ruleEvaluation = handleRuleEvaluationDebug(rule, 'testRuleset', [outputAction], undefined, {}, [false], undefined);

    expect(ruleEvaluation.outputActions.length).toBe(1);
    expect(ruleEvaluation.rule.id).toBe(rule.id);
    expect(ruleEvaluation.error).not.toBeDefined();
    expect(ruleEvaluation.triggers[rule.id].isMobileDevice.newValue).toBe(false);
  });

  it('handleRuleEvaluationDebug should create a rule evaluation object with error', () => {
    const error = { errorMessage: 'this is an error thrown at rule evaluation' };
    const ruleEvaluation = handleRuleEvaluationDebug(rule, 'testRuleset', undefined, error, {}, [false], undefined);

    expect(ruleEvaluation.outputActions).toBeUndefined();
    expect(ruleEvaluation.rule.id).toBe(rule.id);
    expect(ruleEvaluation.error.errorMessage).toBe(error.errorMessage);
    expect(ruleEvaluation.triggers[rule.id].isMobileDevice.newValue).toBe(false);
  });

  it('handleRuleEvaluationDebug should compute triggers old and new value', () => {
    const ruleEvaluation = handleRuleEvaluationDebug(rule, 'testRuleset', [], undefined, {}, [true], [false]);

    expect(ruleEvaluation.outputActions.length).toBe(0);
    expect(ruleEvaluation.rule.id).toBe(rule.id);
    expect(ruleEvaluation.triggers[rule.id].isMobileDevice.oldValue).toBe(false);
    expect(ruleEvaluation.triggers[rule.id].isMobileDevice.newValue).toBe(true);
  });
});
