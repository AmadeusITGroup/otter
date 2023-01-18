import { BehaviorSubject, firstValueFrom, merge, Observable, of } from 'rxjs';
import { delay, distinctUntilChanged, shareReplay, switchMap, takeUntil, tap } from 'rxjs/operators';
import { EngineDebugger } from './debug/engine.debug';
import { FactObject, RulesEngineOptions } from './engine.interface';
import { Fact } from './fact/index';
import { filterRulesetsEventStream } from './helpers/filter-ruleset-event.operator';
import { Operator, operatorList, UnaryOperator } from './operator/index';
import { RulesetExecutor } from './ruleset-executor';
import { ActionBlock, Ruleset } from './structure';

/** Rules engine */
export class RulesEngine {

  /** Map of registered fact stream, this map is mutated by the ruleset executors */
  private factMap: Record<string, FactObject<any>> = {};

  /** Subject containing the rulesets and the results stream*/
  private readonly rulesetMapSubject = new BehaviorSubject<Record<string, RulesetExecutor>>({});

  /** Map of available operators */
  public operators: Record<string, Operator<unknown, unknown>>;

  /** List of events for the current state of the rules engine */
  public readonly events$: Observable<ActionBlock[]>;

  /** Delay before fact stream defaulting value */
  public factDefaultDelay?: number;

  /**
   * Instance of engine debug object; Undefined if debugMode is not active
   */
  public readonly engineDebug?: EngineDebugger;

  /** Name of the rules engine instance */
  public readonly rulesEngineInstanceName: string;

  /**
   * Performance reporter to use for performance measurements.
   *
   * @default window.performance on browser only, undefined on node
   */
  public readonly performance;

  /**
   * Flag to check if the run is in debug mode or not
   */
  public get debugMode(): boolean {
    return !!this.engineDebug;
  }

  /**
   * Rules engine
   *
   * @param options rules engine options
   */
  constructor(options?: RulesEngineOptions) {
    this.performance = options?.performance || (typeof window !== 'undefined' ? window.performance : undefined);
    this.engineDebug = options?.debugger;
    this.engineDebug?.registerRuleEngine(this);

    this.rulesEngineInstanceName = options?.rulesEngineInstanceName || 'RulesEngine';
    this.factDefaultDelay = options?.factDefaultDelay;
    // Load default operators
    this.operators = operatorList.reduce<Record<string, Operator<any, any>>>((acc, operator) => {
      acc[operator.name] = operator;
      return acc;
    }, {});
    this.events$ = this.rulesetMapSubject.pipe(
      this.prepareActionsStream(),
      this.handleActionsStreamOutput()
    );
    if (options?.facts) {
      this.upsertFacts(options.facts);
    }
    if (options?.rules) {
      this.upsertRulesets(options.rules);
    }
    if (options?.operators) {
      this.upsertOperators(options.operators);
    }
  }

  /**
   * Attach debug events to actions stream if debug engine is activated
   *
   * @param actionsStream
   */
  private handleActionsStreamOutput<T extends ActionBlock = ActionBlock>(): (actionsStream$: Observable<T[]>) => Observable<T[]> {
    return (actionsStream$: Observable<T[]>) => this.engineDebug ? actionsStream$.pipe(tap((allActions) => this.engineDebug!.allActionsChange(allActions))) : actionsStream$;
  }

  /**
   * Create the actions stream event based on provided active rulesets ids; Handle debug too
   *
   * @param ruleSets
   */
  private prepareActionsStream<T extends ActionBlock = ActionBlock>(ruleSets?: string[]): (rulesetMapSubject$: Observable<Record<string, RulesetExecutor>>) => Observable<T[]> {
    return (rulesetMapSubject$: Observable<Record<string, RulesetExecutor>>) => (this.engineDebug ?
      rulesetMapSubject$.pipe(
        tap((ruleSetExecutorMap) => this.engineDebug!.activeRulesetsChange(ruleSetExecutorMap, ruleSets)),
        filterRulesetsEventStream(ruleSets))
      : rulesetMapSubject$.pipe(filterRulesetsEventStream(ruleSets))) as Observable<T[]>;
  }

  /**
   * Create or retrieve a fact stream
   * The fact stream created will be registered in the engine
   *
   * @param id ID of the fact to retrieve
   * @param factValue$ Value stream for the fact
   */
  public retrieveOrCreateFactStream<T = unknown>(id: string, factValue$?: Observable<T>): Observable<T | undefined> {
    // trick to emit undefined if the observable is not immediately emitting (to not bloc execution)
    const obs$ = factValue$ ?
      merge(factValue$, of(undefined).pipe(delay(this.factDefaultDelay || 0), takeUntil(factValue$))) :
      factValue$;
    const factObj = this.factMap[id];
    if (factObj) {
      if (factValue$) {
        factObj.subject.next(obs$);
      }
      return factObj.value$;
    }

    const subject = new BehaviorSubject<Observable<T | undefined> | undefined>(obs$);
    const value$ = subject.pipe(
      switchMap((value) => value || of(undefined)),
      distinctUntilChanged(),
      shareReplay(1)
    );

    this.factMap[id] = {
      subject,
      value$
    };

    return value$;
  }

  /**
   * Retrieve the promise of the latest value of a fact.
   * Return undefined if the fact is not defined.
   *
   * @param id ID of the fact to retrieve
   */
  public retrieveFactValue<T = unknown>(id: string): Promise<T | undefined> | undefined {
    return this.factMap[id].value$ && firstValueFrom(this.retrieveOrCreateFactStream<T>(id), { defaultValue: undefined });
  }

  /**
   * Update or insert fact in rules engine
   *
   * @param facts fact list to add / update
   */
  public upsertFacts<T = unknown>(facts: Fact<T> | Fact<T>[]) {
    (Array.isArray(facts) ? facts : [facts]).forEach(({id, value$}) =>
      this.retrieveOrCreateFactStream(id, value$)
    );
  }

  /**
   * Update or insert rule in rules engine
   *
   * @param rules rule list to add / update
   * @param rulesets
   */
  public upsertRulesets(rulesets: Ruleset[]) {
    this.engineDebug?.addAvailableRulesets(rulesets);

    this.rulesetMapSubject.next(
      rulesets.reduce((accRuleset, ruleset) => {
        accRuleset[ruleset.id] = new RulesetExecutor(ruleset, this);
        return accRuleset;
      }, {...this.rulesetMapSubject.value})
    );
  }

  /**
   * Update or insert operator in rules engine
   *
   * @param operators operator list to add / update
   */
  public upsertOperators(operators: (Operator | UnaryOperator)[]) {
    this.operators = operators.reduce((acc, operator) => {
      acc[operator.name] = operator;
      return acc;
    }, {...this.operators});
  }

  /**
   * Operator to apply on a stream of rulesets ids
   * Returns a stream of actions outputted by the rules engine, corresponding to the rulesetsIds
   */
  public getEventStream<T extends ActionBlock = ActionBlock>(): (rulesetsIds$: Observable<string[] | undefined>) => Observable<T[]> {
    return (rulesetsIds$: Observable<string[] | undefined>) =>
      rulesetsIds$.pipe(
        switchMap((ruleSets) => this.rulesetMapSubject.pipe(this.prepareActionsStream<T>(ruleSets))),
        this.handleActionsStreamOutput()
      );
  }

  /** Get the list of registered facts names */
  public getRegisteredFactsNames() {
    return Object.keys(this.factMap);
  }

}
