import {
  Observable,
  ReplaySubject,
} from 'rxjs';
import {
  concatMap,
  share,
  shareReplay,
  startWith,
  tap,
  withLatestFrom,
} from 'rxjs/operators';
import type {
  RulesEngine,
} from '../engine';
import {
  BaseRulesetExecution,
  DebugEvent,
  EvaluationReason,
  RuleEvaluation,
  RuleEvaluationOutput,
  RulesetExecutionErrorEvent,
  RulesetExecutionEvent,
} from '../engine.interface';
import type {
  Facts,
} from '../fact';
import {
  RulesetExecutor,
} from '../ruleset-executor';
import type {
  ActionBlock,
  Ruleset,
} from '../structure';
import {
  flagCachedRules,
  retrieveRulesetTriggers,
} from './helpers';

export interface EngineDebuggerOptions {
  /**
   * Limit of events to keep in the stack before subscribing to the debugEvents$ stream.
   * @default undefined no limit
   */
  eventsStackLimit?: number;
}

/**
 * Rules engine debugger object to emit debug events
 */
export class EngineDebugger {
  private registeredRuleEngine?: RulesEngine;

  private registeredRulesets: Pick<Ruleset, 'name' | 'id'>[] = [];

  // Keep a small history in case the events$ stream from the engine is subscribed after rules engine initialization
  private readonly debugEventsSubject$: ReplaySubject<() => (Promise<DebugEvent> | DebugEvent)>;

  private performanceMeasures$!: Observable<PerformanceMeasure[]>;

  /** Stream emitting a debug event when is fired; timeline is kept */
  public readonly debugEvents$: Observable<DebugEvent>;

  /** Retrieved the rules engine plugged to the debugger */
  public get rulesEngine(): RulesEngine | undefined {
    return this.registeredRuleEngine;
  }

  /**
   * Instantiate a rules engine debugger
   * @param options Options to configure the debugger
   */
  constructor(options?: EngineDebuggerOptions) {
    this.debugEventsSubject$ = new ReplaySubject<() => (Promise<DebugEvent> | DebugEvent)>(options?.eventsStackLimit);
    this.initializePerformanceObserver();
    this.debugEvents$ = this.debugEventsSubject$.pipe(
      withLatestFrom(this.performanceMeasures$),
      concatMap(async ([eventFunc, performanceMeasures]) => {
        const debugEvent: DebugEvent = await eventFunc();
        if (debugEvent.type === 'RulesetExecution' || debugEvent.type === 'RulesetExecutionError') {
          let rulesetDuration = 0;
          debugEvent.rulesEvaluations.forEach((rule) => {
            const mark = `rules-engine:${
              this.registeredRuleEngine?.rulesEngineInstanceName || ''
            }:${debugEvent.rulesetName}:${rule.rule.name}`;
            const measures = performanceMeasures.filter((m) => m.name === mark);
            const duration = measures.at(-1)?.duration || 0;
            rule.duration = duration;
            rulesetDuration += duration;
          });
          debugEvent.duration = rulesetDuration;
        }
        return debugEvent;
      }),
      tap((debugEvent) => {
        if (debugEvent.type === 'RulesetExecution') {
          this.rulesEngine?.logger?.debug?.(`${debugEvent.rulesetName} has been triggered and resulted in ${JSON.stringify(debugEvent.outputActions)}`);
        }
      }),
      share()
    );
  }

  private initializePerformanceObserver() {
    this.performanceMeasures$ = new Observable<PerformanceMeasure[]>((subscriber) => {
      const performanceObserver = new PerformanceObserver((list) => {
        subscriber.next(list.getEntries() as PerformanceMeasure[]);
      });
      performanceObserver.observe({ entryTypes: ['measure'] });
      return performanceObserver.disconnect();
    }).pipe(startWith([]), shareReplay(1));
  }

  private async createBaseExecutionOutputObject(ruleset: Ruleset, executionCounter: number,
    rulesetInputFacts: string[], runtimeFactValues: Record<string, Facts>,
    rulesetTriggers: Record<string, Record<string, EvaluationReason>>, rulesExecutions: RuleEvaluation[]) {
    const inputFacts = await this.getFactsSnapshot(rulesetInputFacts);

    const baseRulesetOutputExecution: BaseRulesetExecution = {
      executionCounter,
      executionId: `${ruleset.id}-${executionCounter}`,
      rulesetId: ruleset.id,
      rulesetName: ruleset.name,
      inputFacts,
      triggers: rulesetTriggers,
      rulesEvaluations: flagCachedRules(rulesExecutions?.sort((a, b) => a.timestamp - b.timestamp) || [], rulesetTriggers),
      temporaryFacts: runtimeFactValues
    };
    return baseRulesetOutputExecution;
  }

  private async rulesetExecution(
    timestamp: number,
    ruleset: Ruleset,
    executionCounter: number,
    rulesetInputFacts: string[],
    allOutputActions: ActionBlock[],
    runtimeFactValues: Record<string, Facts>,
    rulesetTriggers: Record<string, Record<string, EvaluationReason>>,
    rulesExecutions: RuleEvaluation[]) {
    const baseRulesetOutputExecution = await this.createBaseExecutionOutputObject(ruleset, executionCounter, rulesetInputFacts, runtimeFactValues, rulesetTriggers, rulesExecutions);

    const rulesetOutputExecution: RulesetExecutionEvent = {
      timestamp,
      type: 'RulesetExecution',
      outputActions: allOutputActions,
      ...baseRulesetOutputExecution
    };

    return rulesetOutputExecution;
  }

  private async rulesetExecutionError(
    timestamp: number,
    ruleset: Ruleset,
    rulesetInputFacts: string[],
    executionCounter: number,
    runtimeFactValues: Record<string, Facts>,
    rulesetTriggers: Record<string, Record<string, EvaluationReason>>,
    rulesExecutions: RuleEvaluation[]
  ) {
    const baseRulesetOutputExecution = await this.createBaseExecutionOutputObject(ruleset, executionCounter, rulesetInputFacts, runtimeFactValues, rulesetTriggers, rulesExecutions);

    const rulesExecWithErrors = rulesExecutions.filter((ex) => !!ex && !!ex.error);
    const rulesetOutputExecutionSkip: RulesetExecutionErrorEvent = {
      timestamp,
      type: 'RulesetExecutionError',
      rulesCausingTheError: rulesExecWithErrors.map((e) => e.rule) || [],
      errors: rulesExecWithErrors.map((e) => e.error),
      ...baseRulesetOutputExecution
    };
    return rulesetOutputExecutionSkip;
  }

  /**
   * Plug the debugger to a Rule Engine
   * @param rulesEngine
   */
  public registerRuleEngine(rulesEngine: RulesEngine) {
    this.registeredRuleEngine = rulesEngine;
  }

  /**
   * Handle ruleset execution debug info
   * @param currRes
   * @param prevRes
   * @param allExecutionsValid
   * @param rulesetInputFacts
   * @param runtimeFactValues
   * @param executionCounter
   * @param ruleset
   */
  public handleDebugRulesetExecutionInfo(
    currRes: RuleEvaluationOutput[],
    prevRes: RuleEvaluationOutput[] | undefined,
    allExecutionsValid: boolean,
    rulesetInputFacts: string[],
    runtimeFactValues: Record<string, Facts>,
    executionCounter: number,
    ruleset: Ruleset) {
    const rulesetTriggers = retrieveRulesetTriggers(currRes, prevRes);
    const rulesetOutputExecution = currRes.map((r) => r.evaluation!);

    if (!allExecutionsValid) {
      this.addRulesetExecutionErrorEvent(ruleset, rulesetInputFacts, executionCounter, runtimeFactValues, rulesetTriggers, rulesetOutputExecution);
    }

    return {
      executionCounter,
      rulesetOutputExecution,
      allExecutionsValid,
      rulesetTriggers
    };
  }

  /**
   * Emits an 'AvailableRulesets' debug event when rulesets are registered to the rules engine
   * @param rulesets
   */
  public addAvailableRulesets(rulesets: Ruleset[]) {
    const timestamp = Date.now();
    this.registeredRulesets = [...this.registeredRulesets, ...rulesets.map((r) => ({ name: r.name, id: r.id }))];
    this.debugEventsSubject$.next(() => ({
      timestamp,
      type: 'AvailableRulesets',
      availableRulesets: this.registeredRulesets
    }));
  }

  /**
   * Computes and emits an 'ActiveRulesets' debug event when the active rulesets are changing
   * @param ruleSetExecutorMap map off all rulesets executors
   * @param restrictiveRuleSets ids of the rulesets to activate; if not provided all registered rulesets will be considered as active
   */
  public activeRulesetsChange(ruleSetExecutorMap: Record<string, RulesetExecutor>, restrictiveRuleSets?: string[]) {
    const timestamp = Date.now();
    const rulesets = Object.keys(ruleSetExecutorMap).map((rulesetId) => ruleSetExecutorMap[rulesetId].engineRuleset);
    const activeRulesets = restrictiveRuleSets
      ? Object.values(rulesets).filter((ruleSet) => restrictiveRuleSets.includes(ruleSet.id))
      : Object.values(rulesets);

    this.debugEventsSubject$.next(() => ({
      timestamp,
      type: 'ActiveRulesets',
      rulesets: activeRulesets.map((a) => ({ name: ruleSetExecutorMap[a.id].ruleset.name, id: ruleSetExecutorMap[a.id].ruleset.id }))
    }));
  }

  /**
   * Emits an 'AllActions' debug event each time the rules engine outputs the list of actions
   * @param actions list of outputed actions
   */
  public allActionsChange(actions: ActionBlock[]) {
    const timestamp = Date.now();
    this.debugEventsSubject$.next(() => ({ timestamp, type: 'AllActions', actions }));
  }

  /**
   * Emits a 'RulesetExecution' debug event at the ouput of a successful ruleset execution
   * @param ruleset
   * @param executionCounter
   * @param rulesetInputFacts
   * @param allOutputActions
   * @param runtimeFactValues
   * @param rulesetTriggers
   * @param rulesExecutions
   */
  public addRulesetExecutionEvent(ruleset: Ruleset, executionCounter: number,
    rulesetInputFacts: string[], allOutputActions: ActionBlock[], runtimeFactValues: Record<string, Facts>,
    rulesetTriggers: Record<string, Record<string, EvaluationReason>>, rulesExecutions: RuleEvaluation[]) {
    const timestamp = Date.now();
    this.debugEventsSubject$.next(() => this.rulesetExecution(timestamp, ruleset, executionCounter,
      rulesetInputFacts, allOutputActions, runtimeFactValues, rulesetTriggers, rulesExecutions));
  }

  /**
   * Emits a 'RulesetExecutionError' debug event at the ouput of a failing ruleset execution
   * @param ruleset
   * @param rulesetInputFacts
   * @param executionCounter
   * @param runtimeFactValues
   * @param rulesetTriggers
   * @param rulesExecutions
   */
  public addRulesetExecutionErrorEvent(
    ruleset: Ruleset,
    rulesetInputFacts: string[],
    executionCounter: number,
    runtimeFactValues: Record<string, Facts>,
    rulesetTriggers: Record<string, Record<string, EvaluationReason>>,
    rulesExecutions: RuleEvaluation[]
  ) {
    const timestamp = Date.now();
    this.debugEventsSubject$.next(() => this.rulesetExecutionError(timestamp, ruleset, rulesetInputFacts, executionCounter, runtimeFactValues, rulesetTriggers, rulesExecutions));
  }

  /**
   * Returns a list of fact name and value pairs
   * @param factsNames List of facts names to get the value for
   */
  public async getFactsSnapshot(factsNames: string[]) {
    const facts: { factName: string; value: any }[] = [];
    if (!this.registeredRuleEngine) {
      throw new Error('Rule engine not plugged to the debugger');
    }
    for (const factName of factsNames) {
      facts.push({ factName, value: await this.registeredRuleEngine.retrieveFactValue(factName) });
    }
    return facts;
  }
}
