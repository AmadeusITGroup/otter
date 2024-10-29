import {
  BehaviorSubject,
  of
} from 'rxjs';
import {
  Operator
} from '../operator/operator.interface';
import {
  operatorList
} from '../operator/operators/index';
import {
  RulesetExecutor
} from '../ruleset-executor';
import {
  ActionBlock,
  Ruleset
} from '../structure';
import {
  filterRulesetsEventStream
} from './filter-ruleset-event.operator';

describe('Filter rulesets event operator', () => {
  const rulesets: Ruleset[] = [
    {
      'id': 'ruleset1',
      'name': 'the first ruleset',
      'rules': [
        {
          'id': '6e8t54h6s4e-6erth46sre8th4-d46t8s13t5j1',
          'name': 'the first rule',
          'inputRuntimeFacts': [],
          'inputFacts': [],
          'outputRuntimeFacts': [
            'UI_FACT_2'
          ],
          'rootElement': {
            'elementType': 'RULE_BLOCK',
            'blockType': 'IF_ELSE',
            'condition': {
              'any': [
                {
                  'lhs': {
                    'type': 'LITERAL',
                    'value': true
                  },
                  'operator': 'equals',
                  'rhs': {
                    'type': 'LITERAL',
                    'value': true
                  }
                }
              ]
            },
            'successElements': [
              {
                'elementType': 'ACTION',
                'actionType': 'UPDATE_CONFIG',
                'component': 'o3r-simple-header-pres',
                'library': '@otter/demo-components',
                'property': 'showLanguageSelector',
                'value': false
              },
              {
                'elementType': 'ACTION',
                'actionType': 'UPDATE_CONFIG',
                'component': 'o3r-simple-header-pres',
                'library': '@otter/demo-components',
                'property': 'showLanguageSelector',
                'value': false
              }
            ],
            failureElements: []
          }
        }
      ]
    },
    {
      'id': 'ruleset2',
      'name': 'the second ruleset',
      'rules': [
        {
          'id': '6e8t54h6s4e-6erth46sre8th4-d46t8s13t5j3',
          'name': 'the first rule',
          'inputRuntimeFacts': [],
          'inputFacts': [],
          'outputRuntimeFacts': [
            'UI_FACT_2',
            'UI_FACT_4'
          ],
          'rootElement': {
            'elementType': 'RULE_BLOCK',
            'blockType': 'IF_ELSE',
            'condition': {
              'any': [
                {
                  'lhs': {
                    'type': 'LITERAL',
                    'value': true
                  },
                  'operator': 'equals',
                  'rhs': {
                    'type': 'LITERAL',
                    'value': true
                  }
                }
              ]
            },
            'successElements': [
              {
                'elementType': 'ACTION',
                'actionType': 'UPDATE_CONFIG',
                'component': 'o3r-simple-header-pres',
                'library': '@otter/demo-components',
                'property': 'showLanguageSelector',
                'value': false
              },
              {
                'elementType': 'ACTION',
                'actionType': 'SET_FACT',
                'fact': 'UI_FACT_2',
                'value': true
              },
              {
                'elementType': 'ACTION',
                'actionType': 'SET_FACT',
                'fact': 'UI_FACT_4',
                'value': true
              }
            ],
            'failureElements': [
              {
                'elementType': 'ACTION',
                'actionType': 'SET_FACT',
                'fact': 'UI_FACT_2',
                'value': false
              }
            ]
          }
        }
      ]
    }
  ];

  const operators = operatorList.reduce<Record<string, Operator<any, any>>>((acc, operator) => {
    acc[operator.name] = operator;
    return acc;
  }, {});

  const firstValue = rulesets.reduce<Record<string, RulesetExecutor>>((accRuleset, ruleset) => {
    accRuleset[ruleset.id] = new RulesetExecutor(ruleset, { retrieveOrCreateFactStream: () => of(undefined), operators } as any);
    return accRuleset;
  }, {});

  const rulesetsMapSubject$ = new BehaviorSubject<Record<string, RulesetExecutor>>(firstValue);

  // eslint-disable-next-line jest/no-done-callback -- eventually rewrite the test
  test('should consider only first ruleset', (done) => {
    rulesetsMapSubject$.pipe(
      filterRulesetsEventStream(['ruleset1'])
    ).subscribe((data) => {
      expect(data.length).toBe(2);
      done();
    });
  });

  // eslint-disable-next-line jest/no-done-callback -- eventually rewrite the test
  test('should consider only second ruleset', (done) => {
    rulesetsMapSubject$.pipe(
      filterRulesetsEventStream(['ruleset2'])
    ).subscribe((data) => {
      expect(data.length).toBe(1);
      done();
    });
  });

  // eslint-disable-next-line jest/no-done-callback -- eventually rewrite the test
  test('should consider all rulesets by not passing any filter', (done) => {
    rulesetsMapSubject$.pipe(
      filterRulesetsEventStream()
    ).subscribe((data) => {
      expect(data.length).toBe(3);
      done();
    });
  });

  // eslint-disable-next-line jest/no-done-callback -- eventually rewrite the test
  test('should consider all rulesets ids passed', (done) => {
    rulesetsMapSubject$.pipe(
      filterRulesetsEventStream(['ruleset1', 'ruleset2'])
    ).subscribe((data) => {
      expect(data.length).toBe(3);
      done();
    });
  });

  test('should not emit if ruleset id does not match any registered ruleset', async () => {
    let emittedActions: ActionBlock[] | undefined;

    rulesetsMapSubject$.pipe(
      filterRulesetsEventStream(['ruleset3'])
    ).subscribe((data) => {
      emittedActions = data;
    });

    await jest.advanceTimersByTimeAsync(500);
    expect(emittedActions).toBe(undefined);
  });
});
