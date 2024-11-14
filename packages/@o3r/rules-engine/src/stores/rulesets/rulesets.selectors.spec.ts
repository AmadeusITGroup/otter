import {RulesetsModel, RulesetsState} from './rulesets.state';
import * as selectors from './rulesets.selectors';

describe('RuleSets Selector tests', () => {

  const today = new Date();
  const beforeYesterday = new Date(today);
  const afterTomorrow = new Date(today);
  const tomorrow = new Date(today);

  beforeYesterday.setDate(beforeYesterday.getDate() - 2);
  afterTomorrow.setDate(afterTomorrow.getDate() + 2);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const r1: RulesetsModel = {
    name: 'r1_name',
    rules: [],
    id: 'r1',
    validityRange: {
      from: beforeYesterday.toISOString(),
      to: afterTomorrow.toISOString()
    }
  };

  const r2: RulesetsModel = {
    name: 'r2_name',
    rules: [],
    id: 'r2',
    linkedComponent: {
      library: '@mylibrary',
      name: 'mycomponent'
    }
  };

  const r3: RulesetsModel = {
    id: 'r3',
    name: 'r3_name',
    rules: []
  };

  const r4: RulesetsModel = {
    id: 'r4',
    name: 'r4_name',
    rules: [],
    validityRange: {
      from: tomorrow.toISOString(),
      to: afterTomorrow.toISOString()
    }
  };

  const r5: RulesetsModel = {
    id: 'r5',
    name: 'r5_name',
    rules: [],
    validityRange: {
      from: beforeYesterday.toISOString()
    }
  };

  const r6: RulesetsModel = {
    id: 'r6',
    name: '6_name',
    rules: [],
    validityRange: {
      to: afterTomorrow.toISOString()
    }
  };

  const r7: RulesetsModel = {
    id: 'r7',
    name: 'r7_name',
    rules: [],
    validityRange: {}
  };

  const r8: RulesetsModel = {
    id: 'r8',
    name: 'r8_name',
    rules: [],
    validityRange: {
      from: beforeYesterday.toISOString(),
      to: afterTomorrow.toISOString()
    },
    linkedComponent: {
      library: '@mylibrary',
      name: 'mycomponent'
    }
  };

  const r9: RulesetsModel = {
    id: 'r9',
    name: 'r9_name',
    rules: [],
    validityRange: {
      from: afterTomorrow.toISOString()
    },
    linkedComponent: {
      library: '@mylibrary',
      name: 'thisComponentWillBeIgnored'
    }
  };

  it('should return the ruleset in range', () => {
    const state: RulesetsState = {
      ids: [r1.id, r2.id],
      entities: {
        'r1': r1,
        'r2': r2
      },
      requestIds: []
    };
    const allRuleSetsArray = selectors.selectAllRulesets.projector(state);
    const rulesetsInRange = selectors.selectRuleSetsInRange.projector(allRuleSetsArray);

    expect(selectors.selectActiveRuleSets.projector(rulesetsInRange)).toEqual(['r1']);
  });

  it('should return the rulest with no validity or on demand', () => {
    const state: RulesetsState = {
      ids: [r3.id, r2.id],
      entities: {
        'r3': r3,
        'r2': r2
      },
      requestIds: []
    };
    const allRuleSetsArray = selectors.selectAllRulesets.projector(state);
    const rulesetsInRange = selectors.selectRuleSetsInRange.projector(allRuleSetsArray);

    expect(selectors.selectActiveRuleSets.projector(rulesetsInRange)).toEqual(['r3']);
  });

  it('should exclude the one not in validity range', () => {
    const state: RulesetsState = {
      ids: [r3.id, r4.id],
      entities: {
        'r3': r3,
        'r4': r4
      },
      requestIds: []
    };
    const allRuleSetsArray = selectors.selectAllRulesets.projector(state);
    const rulesetsInRange = selectors.selectRuleSetsInRange.projector(allRuleSetsArray);

    expect(selectors.selectActiveRuleSets.projector(rulesetsInRange)).toEqual(['r3']);
  });

  it('should not find valid rulesets', () => {
    const state: RulesetsState = {
      ids: [r2.id, r4.id],
      entities: {
        'r2': r2,
        'r4': r4
      },
      requestIds: []
    };
    const allRuleSetsArray = selectors.selectAllRulesets.projector(state);
    const rulesetsInRange = selectors.selectRuleSetsInRange.projector(allRuleSetsArray);

    expect(selectors.selectActiveRuleSets.projector(rulesetsInRange)).toEqual([]);
  });

  it('should find a ruleset valid starting from a date in the past', () => {
    const state: RulesetsState = {
      ids: [r2.id, r4.id, r5.id],
      entities: {
        'r2': r2,
        'r4': r4,
        'r5': r5
      },
      requestIds: []
    };
    const allRuleSetsArray = selectors.selectAllRulesets.projector(state);
    const rulesetsInRange = selectors.selectRuleSetsInRange.projector(allRuleSetsArray);

    expect(selectors.selectActiveRuleSets.projector(rulesetsInRange)).toEqual(['r5']);
  });

  it('should find a ruleset valid until a date in the future', () => {
    const state: RulesetsState = {
      ids: [r2.id, r4.id, r6.id],
      entities: {
        'r2': r2,
        'r4': r4,
        'r6': r6
      },
      requestIds: []
    };
    const allRuleSetsArray = selectors.selectAllRulesets.projector(state);
    const rulesetsInRange = selectors.selectRuleSetsInRange.projector(allRuleSetsArray);

    expect(selectors.selectActiveRuleSets.projector(rulesetsInRange)).toEqual(['r6']);
  });

  it('should consider valid a ruleset with validity empty', () => {
    const state: RulesetsState = {
      ids: [r2.id, r4.id, r7.id],
      entities: {
        'r2': r2,
        'r4': r4,
        'r7': r7
      },
      requestIds: []
    };
    const allRuleSetsArray = selectors.selectAllRulesets.projector(state);
    const rulesetsInRange = selectors.selectRuleSetsInRange.projector(allRuleSetsArray);

    expect(selectors.selectActiveRuleSets.projector(rulesetsInRange)).toEqual(['r7']);
  });

  it('onDemand should take precedence over validity', () => {
    const state: RulesetsState = {
      ids: [r2.id, r4.id, r8.id],
      entities: {
        'r2': r2,
        'r4': r4,
        'r8': r8
      },
      requestIds: []
    };
    const allRuleSetsArray = selectors.selectAllRulesets.projector(state);
    const rulesetsInRange = selectors.selectRuleSetsInRange.projector(allRuleSetsArray);

    expect(selectors.selectActiveRuleSets.projector(rulesetsInRange)).toEqual([]);
  });

  it('should filter out the linked components rulesets outside the validity range', () => {
    const state: RulesetsState = {
      ids: [r9.id],
      entities: {
        'r9': r9
      },
      requestIds: []
    };
    const allRuleSetsArray = selectors.selectAllRulesets.projector(state);
    const rulesetsInRange = selectors.selectRuleSetsInRange.projector(allRuleSetsArray);

    expect(selectors.selectRuleSetLinkComponents.projector(rulesetsInRange)).toEqual({});
  });

  it('selectRuleSetsInRange should filter out rulesets outside of the validity range', () => {
    const state: RulesetsState = {
      ids: [r1.id, r2.id, r3.id, r4.id, r5.id, r6.id, r7.id, r8.id, r9.id],
      entities: {
        'r1': r1,
        'r2': r2,
        'r3': r3,
        'r4': r4,
        'r5': r5,
        'r6': r6,
        'r7': r7,
        'r8': r8,
        'r9': r9
      },
      requestIds: []
    };
    const allRuleSetsArray = selectors.selectAllRulesets.projector(state);

    expect(selectors.selectRuleSetsInRange.projector(allRuleSetsArray)).toEqual([r1, r2, r3, r5, r6, r7, r8]);
  });
});

