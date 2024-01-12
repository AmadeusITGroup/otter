import { Inject, Injectable, Optional } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { combineLatest, firstValueFrom, Observable } from 'rxjs';
import { map, scan, shareReplay } from 'rxjs/operators';
import type { ActiveRulesetsEvent, AvailableRulesets, BaseRulesetExecution, DebugEvent, Ruleset, RulesetExecutionErrorEvent, RulesetExecutionEvent } from '../engine';
import { RulesEngineRunnerService } from '../services';
import { RulesetsModel, RulesetsStore, selectRulesetsEntities } from '../stores';
import { RulesEngineDevtoolsServiceOptions } from './rules-engine-devkit.interface';
import { OTTER_RULES_ENGINE_DEVTOOLS_DEFAULT_OPTIONS, OTTER_RULES_ENGINE_DEVTOOLS_OPTIONS } from './rules-engine-devtools.token';

@Injectable({
  providedIn: 'root'
})
export class OtterRulesEngineDevtools {

  /** Stream of rules engine report */
  public readonly rulesEngineReport$?: Observable<{ events: DebugEvent[]; rulesetMap: Record<string, Ruleset> }>;

  /** Stream of rules engine event */
  public readonly rulesEngineEvents$?: Observable<DebugEvent[]>;

  /**
   * Return true if the rules engine debug option is activated
   */
  public get isRulesEngineDebugActivated(): boolean {
    return !!this.rulesEngineService.engine.debugMode;
  }

  constructor(
    protected store: Store<RulesetsStore>,
    private readonly rulesEngineService: RulesEngineRunnerService,
    @Optional() @Inject(OTTER_RULES_ENGINE_DEVTOOLS_OPTIONS) options: RulesEngineDevtoolsServiceOptions) {

    const eventsStackLimit = (options || OTTER_RULES_ENGINE_DEVTOOLS_DEFAULT_OPTIONS).rulesEngineStackLimit;
    this.rulesEngineEvents$ = this.rulesEngineService.engine.engineDebug?.debugEvents$.pipe(
      scan((previousEvents, currentEvent) => {
        const stack = eventsStackLimit && previousEvents.length === eventsStackLimit ? previousEvents.slice(1) : previousEvents;
        return [...stack, currentEvent];
      }, [] as DebugEvent[]),
      shareReplay(1)
    );

    this.rulesEngineReport$ = this.rulesEngineEvents$ && combineLatest([this.rulesEngineEvents$, this.store.pipe(select(selectRulesetsEntities))]).pipe(
      map(([events, rulesetEntities]) => {
        const rulesetMap: Record<string, Ruleset> = Object.entries(rulesetEntities)
          .reduce<Record<string, RulesetsModel>>((acc, [id, ruleset]) => {
            if (ruleset) {
              acc[id] = ruleset;
            }
            return acc;
          }, {});
        return { events, rulesetMap };
      }),
      shareReplay(1)
    );
  }

  /** Return the list of debug events emitted by rules engine */
  public async getCurrentRulesEngineEventsStack(): Promise<DebugEvent[] | undefined> {
    return this.rulesEngineEvents$ && firstValueFrom(this.rulesEngineEvents$);
  }

  /** Returns the list of active rulesets (name and id) at the moment when the function is called */
  public async getActiveRulesets() {
    const lastActiveRulesetsEvent = (this.rulesEngineEvents$ && await firstValueFrom(this.rulesEngineEvents$))?.filter(e => e.type === 'ActiveRulesets').reverse()[0];
    return (lastActiveRulesetsEvent as ActiveRulesetsEvent)?.rulesets;
  }

  /** Returns the list of available rulesets (name and id) at the moment when the function is called */
  public async getAvailableRulesets() {
    const lastAvailableRulesetsEvent = (this.rulesEngineEvents$ && await firstValueFrom(this.rulesEngineEvents$))?.filter(e => e.type === 'AvailableRulesets').reverse()[0];
    return (lastAvailableRulesetsEvent as AvailableRulesets)?.availableRulesets;
  }

  /** Returns the list of output actions emitted by the rules engine at the moment when the function is called */
  public async getAllOutputActions() {
    return (this.rulesEngineEvents$ && await firstValueFrom(this.rulesEngineEvents$))?.filter(e => e.type === 'AllActions')?.reverse()[0];
  }

  /**
   * Get the list of executions for the given ruleset
   * @param rulesetId
   */
  public async getRulesetExecutions(rulesetId: string): Promise<(RulesetExecutionEvent | RulesetExecutionErrorEvent)[] | undefined> {
    return (this.rulesEngineEvents$ && await firstValueFrom(this.rulesEngineEvents$))?.filter(
      (e): e is RulesetExecutionEvent | RulesetExecutionErrorEvent =>
        (e.type === 'RulesetExecution' || e.type === 'RulesetExecutionError')
        && (e as BaseRulesetExecution).rulesetId === rulesetId);
  }

  /**
   * Check if the ruleset is activ in the moment when the function is called
   * @param rulesetId
   * @returns True if the ruleset is active; False if the ruleset is inactive or it does not exist
   */
  public async isRulesetActive(rulesetId: string) {
    return !!(await this.getActiveRulesets())?.find(r => r.id === rulesetId);
  }

  /**
   * Get the list of rules executed for the specified ruleset
   * @param rulesetId
   */
  public async getRulesEvaluationsForRuleset(rulesetId: string) {
    const rulesetExec = await this.getRulesetExecutions(rulesetId);
    return rulesetExec?.map(e => (e as BaseRulesetExecution)?.rulesEvaluations?.filter(re => !re.cached)).flat();
  }

  /**
   * Get the list of input facts (name, current value) for the specified ruleset, at the moment when the function is called
   * @param rulesetId
   */
  public async getInputFactsForRuleset(rulesetId: string) {
    const rulesetExecutions = await this.getRulesetExecutions(rulesetId);
    return rulesetExecutions ? (rulesetExecutions[rulesetExecutions.length - 1] as BaseRulesetExecution).inputFacts : undefined;
  }

  /**
   * Get the list of triggers for the specified ruleset
   * @param rulesetId
   */
  public async getTriggersForRuleset(rulesetId: string) {
    return (await this.getRulesEvaluationsForRuleset(rulesetId))?.map(e => e.triggers).flat().map(triggersMap => Object.values(triggersMap)).flat();
  }

  /**
   * Get the list of outputed actions emitted by the given ruleset, at the moment when the function is called
   * @param rulesetId
   */
  public async getOutputActionsForRuleset(rulesetId: string) {
    const rulesetExecutions = await this.getRulesetExecutions(rulesetId);
    return rulesetExecutions ? (rulesetExecutions[rulesetExecutions.length - 1] as RulesetExecutionEvent).outputActions : undefined;
  }

  /** Get the list of fact names and corresponding values */
  public getAllFactsSnapshot() {
    const registeredFacts = this.rulesEngineService?.engine.getRegisteredFactsNames();
    if (registeredFacts) {
      return this.rulesEngineService.engine.engineDebug?.getFactsSnapshot(registeredFacts);
    }
  }

  /**
   * Retrieve the ruleset information (rules, linkedComponent, validity range etc.) for a ruleset id
   * @param rulesetId
   */
  public getRulesetInformation(rulesetId: string): Promise<Ruleset | undefined> {
    return firstValueFrom(this.store.pipe(
      select(selectRulesetsEntities),
      map((entities) => entities[rulesetId] as Ruleset | undefined)
    ));
  }
}
