import {Inject, Injectable, OnDestroy, Optional} from '@angular/core';
import {select, Store} from '@ngrx/store';
import {BehaviorSubject, combineLatest, Observable, Subscription} from 'rxjs';
import {filter, map, shareReplay, switchMap} from 'rxjs/operators';
import type {ActionBlock, Fact, Operator, Ruleset, UnaryOperator} from '../../engine/index';
import {EngineDebugger, operatorList, RulesEngine} from '../../engine/index';
import type {RulesetsStore} from '../../stores';
import {
  selectActiveRuleSets,
  selectAllRulesets,
  selectComponentsLinkedToRuleset,
  setRulesetsEntities
} from '../../stores';
import {RULES_ENGINE_OPTIONS, RulesEngineServiceOptions} from '../rules-engine.token';
import {LoggerService} from '@o3r/logger';
import type {RulesEngineActionHandler} from '@o3r/core';

@Injectable()
export class RulesEngineRunnerService implements OnDestroy {

  protected subscription = new Subscription();

  /** Rulesets to restrict the execution of the engine */
  protected ruleSets$: Observable<string[] | undefined>;

  /** Observable of component linked to the component */
  protected linkedComponents$: BehaviorSubject<{ [key: string]: number }> = new BehaviorSubject({});

  /** Map of engines dedicated to each rule sets */
  public readonly engine: RulesEngine;

  /** stream of the whole ruleset results */
  public events$: Observable<ActionBlock[]>;

  /** Enable action execution on new state change */
  public enabled: boolean;

  /** List of action handlers */
  public readonly actionHandlers = new Set<RulesEngineActionHandler>();

  constructor(
    private readonly store: Store<RulesetsStore>,
    private readonly logger: LoggerService,
    @Optional() @Inject(RULES_ENGINE_OPTIONS) engineConfig?: RulesEngineServiceOptions) {
    this.enabled = !engineConfig?.dryRun;
    this.engine = new RulesEngine({
      debugger: engineConfig?.debug ? new EngineDebugger({eventsStackLimit: engineConfig?.debugEventsStackLimit}) : undefined,
      logger: this.logger
    });
    this.ruleSets$ = combineLatest([
      this.store.pipe(select(selectActiveRuleSets)),
      this.linkedComponents$.pipe(
        switchMap((linkedComponentsNamesMap) => this.store.pipe(
          select(selectComponentsLinkedToRuleset),
          map((rulesetsWithLinkedComponentsMap) =>
            Object.keys(rulesetsWithLinkedComponentsMap.or).filter((rulesetId) =>
              rulesetsWithLinkedComponentsMap.or[rulesetId].some((componentId) => linkedComponentsNamesMap[componentId] > 0)
            )
          )
        ))
      )
    ]).pipe(
      map(([activeRulesets, linkedComponentsRulesetsIds]) => ([...activeRulesets, ...linkedComponentsRulesetsIds]))
    );

    this.events$ = this.ruleSets$.pipe(
      this.engine.getEventStream<ActionBlock>(),
      shareReplay(1)
    );

    this.upsertOperators(operatorList);

    this.subscription.add(
      this.store.pipe(
        select(selectAllRulesets)
      ).subscribe((rulesets: Ruleset[]) => this.engine.upsertRulesets(rulesets))
    );

    this.subscription.add(
      this.events$.pipe(filter(() => this.enabled)).subscribe(async (events) => {
        await this.executeActions(events);
      })
    );
  }

  /**
   * Execute the list of actions
   * @param actions
   */
  protected async executeActions(actions: ActionBlock[]) {
    const actionHandlers = [...this.actionHandlers];

    const supportedActions = new Set(actionHandlers.map((handler) => handler.supportingActions).flat());

    const actionMaps = actions
      .filter((action) => {
        const isKnown = supportedActions.has(action.actionType);
        if (!isKnown) {
          this.logger.warn(`The action ${action.actionType} does not have registered handler`);
        }
        return isKnown;
      })
      .reduce((acc, action) => {
        acc[action.actionType] ||= [];
        acc[action.actionType].push(action);
        return acc;
      }, {} as Record<string, ActionBlock[]>);

    const handling = actionHandlers
      .map((handler) =>
        handler.executeActions(
          handler.supportingActions
            .filter((supportedAction) => actionMaps[supportedAction])
            .reduce<ActionBlock[]>((acc, supportedAction) => acc.concat(actionMaps[supportedAction]), [])
        )
      );

    await Promise.all(handling);
  }

  /**
   * Update or insert fact in rules engine
   * @param facts fact list to add / update
   */
  public upsertFacts(facts: Fact<unknown> | Fact<unknown>[]) {
    this.engine.upsertFacts(facts);
  }

  /**
   * Update or insert operator in rules engine
   * @param operators operator list to add / update
   */
  public upsertOperators(operators: (Operator<any, any> | UnaryOperator<any>)[]) {
    this.engine.upsertOperators(operators);
  }

  /**
   * Upsert a list of RuleSets to be run in the engine
   * @param ruleSets
   */
  public upsertRulesets(ruleSets: Ruleset[]) {
    this.store.dispatch(setRulesetsEntities({entities: ruleSets}));
  }

  /** @inheritdoc */
  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  /**
   * Enable temporary a rule set
   * @param componentComputedName Name of the component to enable the ruleset for
   */
  public enableRuleSetFor(componentComputedName: string) {
    const newMap = this.linkedComponents$.value;
    newMap[componentComputedName] = newMap[componentComputedName] ? newMap[componentComputedName] + 1 : 1;
    this.linkedComponents$.next(newMap);
  }

  /**
   * Disable temporary a rule set
   * @param componentComputedName Name of the component to disable the ruleset for
   */
  public disableRuleSetFor(componentComputedName: string) {
    const newMap = this.linkedComponents$.value;
    if (newMap[componentComputedName] > 0) {
      newMap[componentComputedName]--;
      this.linkedComponents$.next(newMap);
    }
  }
}
