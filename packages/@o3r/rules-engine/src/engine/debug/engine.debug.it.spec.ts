import { BehaviorSubject, firstValueFrom, Subject, Subscription } from 'rxjs';
import { reduce, skip, take } from 'rxjs/operators';
import { rulesetsObj } from '../../../testing/mocks/two-rulesets';
import { RulesEngine } from '../engine';
import { ActiveRulesetsEvent, AllActionsEvent, AvailableRulesets, DebugEvent, RulesEngineOptions, RulesetExecutionEvent } from '../engine.interface';
import { EngineDebugger } from './engine.debug';

class MockPerformanceObserver {
  public static readonly supportedEntryTypes: string[] = ['mark', 'measure'];
  public observe = jest.fn();
  public disconnect = jest.fn();
  public takeRecords = jest.fn();
  public constructor() {}
}

describe('Rules engine debug', () => {
  let rulesEngine: RulesEngine;
  let mark: jest.Mock<any, any>;
  let measure: jest.Mock<any, any>;
  let marks: string[];
  let isMobileDevice$: Subject<boolean>;
  let pageUrl$: Subject<string | undefined>;
  let destinationLocationCode$: Subject<string | undefined>;

  const subscriptions: Subscription[] = [];

  beforeEach(() => {
    isMobileDevice$ = new BehaviorSubject<boolean | undefined>(false);
    pageUrl$ = new BehaviorSubject<string | undefined>('');
    destinationLocationCode$ = new BehaviorSubject<string | undefined>('');

    const facts = [
      {id: 'isMobileDevice', value$: isMobileDevice$},
      {id: 'pageUrl', value$: pageUrl$},
      {id: 'destinationLocationCode', value$: destinationLocationCode$}
    ];

    marks = [];
    mark = jest.fn().mockImplementation((name: string) => marks.push(name));
    measure = jest.fn().mockImplementation((name: string) => marks.push(name));
    global.PerformanceObserver = MockPerformanceObserver;
    const engineDebugger = new EngineDebugger();
    const options: RulesEngineOptions = {
      rules: rulesetsObj.rulesets,
      facts,
      debugger: engineDebugger,
      rulesEngineInstanceName: 'testRuleEngine',
      performance: {mark, measure}
    };

    rulesEngine = new RulesEngine(options);
    subscriptions.push(rulesEngine.events$.subscribe(() => true));
  });

  afterEach(() => {
    subscriptions.forEach(s => s.unsubscribe());
  });

  it('should handle initialization events', async () => {
    const events = await firstValueFrom(
      rulesEngine.engineDebug.debugEvents$
        .pipe(
          take(5),
          reduce((acc, ev) => ([...acc, ev]), [] as DebugEvent[])
        )
    );

    expect(events[0].type).toBe('AvailableRulesets');
    expect((events[0] as AvailableRulesets).availableRulesets.length).toBe(2);

    expect(events[1].type).toBe('ActiveRulesets');
    expect((events[1] as ActiveRulesetsEvent).rulesets.length).toBe(2);

    expect(events[2].type).toBe('RulesetExecution');
    expect((events[2] as RulesetExecutionEvent).rulesetId).toBe(rulesetsObj.rulesets[0].id);
    expect((events[2] as RulesetExecutionEvent).outputActions.length).toBe(1); // one action emitted

    const ruleOneSecondRulesetId = rulesetsObj.rulesets[1].rules[0].id;
    const ruleTwoSecondRulesetId = rulesetsObj.rulesets[1].rules[1].id;

    expect(events[3].type).toBe('RulesetExecution');
    expect((events[3] as RulesetExecutionEvent).rulesetId).toBe(rulesetsObj.rulesets[1].id);
    expect(Object.keys((events[3] as RulesetExecutionEvent).triggers).length).toBe(2); // both rules considered at initial ruleset execution
    expect((events[3] as RulesetExecutionEvent).triggers[ruleOneSecondRulesetId].destinationLocationCode.newValue).toBe('');
    expect((events[3] as RulesetExecutionEvent).triggers[ruleOneSecondRulesetId].destinationLocationCode.oldValue).not.toBeDefined();
    expect((events[3] as RulesetExecutionEvent).triggers[ruleOneSecondRulesetId].pageUrl.newValue).toBe('');
    expect((events[3] as RulesetExecutionEvent).triggers[ruleTwoSecondRulesetId].isMobileDevice.newValue).toBe(false);
    expect((events[3] as RulesetExecutionEvent).outputActions.length).toBe(1); // one action emitted

    expect(events[4].type).toBe('AllActions');
    expect((events[4] as AllActionsEvent).actions.length).toBe(2); // total of 2 actions emitted

    expect(mark).toHaveBeenCalledTimes(3 * 2); // 3 start events and 3 end events
    expect(measure).toHaveBeenCalledTimes(3);
    expect(marks).toHaveLength(3 + 3 * 2);
    marks.forEach((m) => expect(m).toMatch(/^rules-engine:testRuleEngine/));
  });

  it('should execute ruleset when a fact changes', async () => {
    const events$ = firstValueFrom(
      rulesEngine.engineDebug.debugEvents$
        .pipe(
          skip(5), // skip initial events
          take(2), // consider next 2 events (an execution and an actions output emit)
          reduce((acc, ev) => ([...acc, ev]), [] as DebugEvent[])
        )
    );

    pageUrl$.next('/upsell');

    const events = await events$;

    const ruleOneSecondRulesetId = rulesetsObj.rulesets[1].rules[0].id;
    const ruleTwoSecondRulesetId = rulesetsObj.rulesets[1].rules[1].id;
    // eslint-disable-next-line no-use-before-define
    expectForFirstExecutionAfterInitial(events, ruleOneSecondRulesetId, ruleTwoSecondRulesetId);

    expect(mark).toHaveBeenCalledTimes(4 * 2); // 4 start events and 4 end events
    expect(measure).toHaveBeenCalledTimes(4);
  });

  it('should correctly report performance when a fact changes', async () => {
    const events$ = firstValueFrom(
      rulesEngine.engineDebug.debugEvents$
        .pipe(
          skip(5), // skip initial events
          take(2), // consider next 2 events (an execution and an actions output emit)
          reduce((acc, ev) => ([...acc, ev]), [] as DebugEvent[])
        )
    );

    expect(mark).toHaveBeenCalledTimes(3 * 2); // 4 start events and 4 end events
    expect(measure).toHaveBeenCalledTimes(3);

    expect(mark).toHaveBeenNthCalledWith(1, 'rules-engine:testRuleEngine:ruleset zero:rule zero:start');
    expect(mark).toHaveBeenNthCalledWith(2, 'rules-engine:testRuleEngine:ruleset zero:rule zero:end');
    expect(mark).toHaveBeenNthCalledWith(3, 'rules-engine:testRuleEngine:first ruleset:rule zero:start');
    expect(mark).toHaveBeenNthCalledWith(4, 'rules-engine:testRuleEngine:first ruleset:rule zero:end');
    expect(mark).toHaveBeenNthCalledWith(5, 'rules-engine:testRuleEngine:first ruleset:rule one:start');
    expect(mark).toHaveBeenNthCalledWith(6, 'rules-engine:testRuleEngine:first ruleset:rule one:end');

    expect(measure).toHaveBeenNthCalledWith(
      1,
      'rules-engine:testRuleEngine:ruleset zero:rule zero',
      'rules-engine:testRuleEngine:ruleset zero:rule zero:start',
      'rules-engine:testRuleEngine:ruleset zero:rule zero:end'
    );
    expect(measure).toHaveBeenNthCalledWith(
      2,
      'rules-engine:testRuleEngine:first ruleset:rule zero',
      'rules-engine:testRuleEngine:first ruleset:rule zero:start',
      'rules-engine:testRuleEngine:first ruleset:rule zero:end'
    );
    expect(measure).toHaveBeenNthCalledWith(
      3,
      'rules-engine:testRuleEngine:first ruleset:rule one',
      'rules-engine:testRuleEngine:first ruleset:rule one:start',
      'rules-engine:testRuleEngine:first ruleset:rule one:end'
    );

    pageUrl$.next('/upsell');
    await events$;

    expect(mark).toHaveBeenCalledTimes(4 * 2); // 4 start events and 4 end events
    expect(measure).toHaveBeenCalledTimes(4);

    expect(mark).toHaveBeenNthCalledWith(7, 'rules-engine:testRuleEngine:first ruleset:rule zero:start');
    expect(mark).toHaveBeenNthCalledWith(8, 'rules-engine:testRuleEngine:first ruleset:rule zero:end');

    expect(measure).toHaveBeenNthCalledWith(
      4,
      'rules-engine:testRuleEngine:first ruleset:rule zero',
      'rules-engine:testRuleEngine:first ruleset:rule zero:start',
      'rules-engine:testRuleEngine:first ruleset:rule zero:end'
    );
  });

  it('should consider multiple executions', async () => {
    const events$ = firstValueFrom(
      rulesEngine.engineDebug.debugEvents$
        .pipe(
          skip(5), // skip initial events
          take(4), // consider next 4 events ( 2 rules executions and 2 actions output )
          reduce((acc, ev) => ([...acc, ev]), [] as DebugEvent[])
        )
    );
    pageUrl$.next('/upsell');
    destinationLocationCode$.next('LON');

    const events = await events$;

    const ruleOneSecondRulesetId = rulesetsObj.rulesets[1].rules[0].id;
    const ruleTwoSecondRulesetId = rulesetsObj.rulesets[1].rules[1].id;

    // eslint-disable-next-line no-use-before-define
    expectForFirstExecutionAfterInitial(events, ruleOneSecondRulesetId, ruleTwoSecondRulesetId);

    expect(events[2].type).toBe('RulesetExecution');
    expect((events[2] as RulesetExecutionEvent).rulesetId).toBe(rulesetsObj.rulesets[1].id);
    expect(Object.keys((events[2] as RulesetExecutionEvent).triggers).length).toBe(1); // only one rule evaluation triggered a new ruleset execution
    expect((events[2] as RulesetExecutionEvent).triggers[ruleOneSecondRulesetId].destinationLocationCode.oldValue).toBe('');
    expect((events[2] as RulesetExecutionEvent).triggers[ruleOneSecondRulesetId].destinationLocationCode.newValue).toBe('LON');
    expect((events[2] as RulesetExecutionEvent).triggers[ruleOneSecondRulesetId].pageUrl).not.toBeDefined();

    const cachedRuleEvaluation = (events[0] as RulesetExecutionEvent).rulesEvaluations.find(ev => ev.rule.id === ruleTwoSecondRulesetId);

    expect(cachedRuleEvaluation.cached).toBe(true);
    expect(cachedRuleEvaluation.outputActions.length).toBe(1); // cached rule one action emitted

    const ruleEvaluated = (events[0] as RulesetExecutionEvent).rulesEvaluations.find(ev => ev.rule.id === ruleOneSecondRulesetId);

    expect(ruleEvaluated.cached).not.toBeDefined();
    expect(ruleEvaluated.outputActions.length).toBe(0); // new evaluation for rule - 4 actions emitted


    expect((events[2] as RulesetExecutionEvent).outputActions.length).toBe(5); // ruleset total 5 action emitted

    expect(events[3].type).toBe('AllActions');
    expect((events[3] as AllActionsEvent).actions.length).toBe(6); // rules engine overall 6 actions emitted

    expect(mark).toHaveBeenCalledTimes(5 * 2); // 5 start events and 5 end events
    expect(measure).toHaveBeenCalledTimes(5);
  });

  it('should get facts name/value pairs at different period in time', async () => {
    const factsNames = rulesEngine.getRegisteredFactsNames();
    const initialFactsValues = await rulesEngine.engineDebug.getFactsSnapshot(factsNames);

    expect(initialFactsValues.length).toBe(3);
    expect(initialFactsValues.find(f => f.factName === 'isMobileDevice').value).toBe(false);
    expect(initialFactsValues.find(f => f.factName === 'destinationLocationCode').value).toBe('');
    expect(initialFactsValues.find(f => f.factName === 'pageUrl').value).toBe('');

    isMobileDevice$.next(true);
    destinationLocationCode$.next('NCE');
    const newFactsValues = await rulesEngine.engineDebug.getFactsSnapshot(factsNames);

    expect(newFactsValues.length).toBe(3);
    expect(newFactsValues.find(f => f.factName === 'isMobileDevice').value).toBe(true);
    expect(newFactsValues.find(f => f.factName === 'destinationLocationCode').value).toBe('NCE');
    expect(newFactsValues.find(f => f.factName === 'pageUrl').value).toBe('');
  });

});

/**
 * @param events
 * @param ruleOneSecondRulesetId
 * @param ruleTwoSecondRulesetId
 */
function expectForFirstExecutionAfterInitial(events: DebugEvent[], ruleOneSecondRulesetId: string, ruleTwoSecondRulesetId: string) {
  expect(events[0].type).toBe('RulesetExecution'); // first emit ruleset execution
  expect((events[0] as RulesetExecutionEvent).rulesetId).toBe(rulesetsObj.rulesets[1].id);
  expect(Object.keys((events[0] as RulesetExecutionEvent).triggers).length).toBe(1); // only one rule evaluation triggered ruleset execution
  expect((events[0] as RulesetExecutionEvent).triggers[ruleOneSecondRulesetId].destinationLocationCode).not.toBeDefined();
  expect((events[0] as RulesetExecutionEvent).triggers[ruleOneSecondRulesetId].pageUrl.oldValue).toBe('');
  expect((events[0] as RulesetExecutionEvent).triggers[ruleOneSecondRulesetId].pageUrl.newValue).toBe('/upsell');

  const cachedRuleEvaluation = (events[0] as RulesetExecutionEvent).rulesEvaluations.find(ev => ev.rule.id === ruleTwoSecondRulesetId);
  expect(cachedRuleEvaluation.cached).toBe(true);
  expect(cachedRuleEvaluation.outputActions.length).toBe(1); // cached rule one action emitted

  const ruleEvaluated = (events[0] as RulesetExecutionEvent).rulesEvaluations.find(ev => ev.rule.id === ruleOneSecondRulesetId);
  expect(ruleEvaluated.cached).not.toBeDefined();
  expect(ruleEvaluated.outputActions.length).toBe(0); // new evaluation for rule - 0 actions emitted

  expect((events[0] as RulesetExecutionEvent).outputActions.length).toBe(1); // ruleset total 1 action emitted

  expect(events[1].type).toBe('AllActions'); // second emit output actions
  expect((events[1] as AllActionsEvent).actions.length).toBe(2); // rules engine overall 2 actions emitted
}

