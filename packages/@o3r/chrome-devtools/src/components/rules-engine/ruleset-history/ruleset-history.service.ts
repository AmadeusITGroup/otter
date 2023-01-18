import { Injectable } from '@angular/core';
import type { ActiveRulesetsEvent, AvailableRulesets, RulesEngineDebugEventsContentMessage, Ruleset, RulesetExecutionErrorEvent, RulesetExecutionEvent } from '@o3r/rules-engine';
import { map, Observable, ReplaySubject } from 'rxjs';

/**
 * Model of a RulesetExecution with more information for debug purpose
 */
export type RulesetExecutionDebug = (RulesetExecutionEvent | RulesetExecutionErrorEvent) & {
  isActive: boolean;
  status: 'Error' | 'Active' | 'Deactivated' | 'NoEffect';
  rulesetInformation: Ruleset | undefined;
};

@Injectable({
  providedIn: 'root'
})
export class RulesetHistoryService {
  private ruleEngineDebugEventsSubject = new ReplaySubject<RulesEngineDebugEventsContentMessage>(1);

  /** Ruleset history stream */
  public ruleEngineDebugEvents$ = this.ruleEngineDebugEventsSubject.asObservable();

  /**
   * History of ruleset executed
   */
  public rulesetExecutions$: Observable<RulesetExecutionDebug[]>;

  constructor() {
    this.rulesetExecutions$ = this.ruleEngineDebugEvents$.pipe(
      map(({events, rulesetMap}) => {
        const availableRulesets = (events.filter(e => e.type === 'AvailableRulesets').reverse()[0] as AvailableRulesets)?.availableRulesets || [];
        const lastActiveRulesets = (events.filter(e => e.type === 'ActiveRulesets').reverse()[0] as ActiveRulesetsEvent)?.rulesets || [];

        return availableRulesets
          .filter((ruleset) => !!ruleset)
          .reduce<(RulesetExecutionEvent | RulesetExecutionErrorEvent)[]>((acc, ruleset) => {
            const rulesetExecutions = events
              .filter((e): e is RulesetExecutionEvent | RulesetExecutionErrorEvent => ((e.type === 'RulesetExecutionError' || e.type === 'RulesetExecution') && e.rulesetId === ruleset.id));
            if (rulesetExecutions) {
              acc.push(...rulesetExecutions);
            }
            return acc;
          }, [])
          .sort((execA, execB) => -(execA.timestamp - execB.timestamp))
          .map((rulesetExecution) => {
            const rulesetInformation = rulesetMap[rulesetExecution.rulesetId];
            const isActive = lastActiveRulesets.find((r) => r.id === rulesetExecution.rulesetId);
            return {
              ...rulesetExecution,
              status: this.getStatus(rulesetExecution, !!isActive),
              isActive: !!isActive,
              rulesetInformation,
              rulesEvaluations: (rulesetExecution.rulesEvaluations || []).sort((evalA, evalB) =>
                (rulesetInformation?.rules.findIndex(r => r.id === evalA.rule.id) || -1) -
              (rulesetInformation?.rules.findIndex(r => r.id === evalB.rule.id) || -1)
              )
            };
          });
      })
    );
  }



  /**
   * Compute the status of the execution depending on its execution event type, the output and whether the execution
   * is still active
   *
   * @param rulesetExecution
   * @param isActive
   * @returns 'Error' | 'Active' | 'Deactivated' | 'NoEffect'
   */
  public getStatus(rulesetExecution: RulesetExecutionErrorEvent | RulesetExecutionEvent, isActive: boolean): 'Error' | 'Active' | 'Deactivated' | 'NoEffect' {
    if (rulesetExecution.type === 'RulesetExecutionError') {
      return 'Error';
    } else if (rulesetExecution.outputActions?.length === 0) {
      return 'NoEffect';
    } else if (isActive) {
      return 'Active';
    }
    return 'Deactivated';
  }

  /**
   * Update the ruleset history
   *
   * @param message Message from the background service
   */
  public update(message: RulesEngineDebugEventsContentMessage) {
    this.ruleEngineDebugEventsSubject.next(message);
  }
}
