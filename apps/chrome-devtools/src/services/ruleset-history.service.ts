import { Injectable } from '@angular/core';
import type { RulesEngineDebugEventsContentMessage, RulesetExecutionDebug } from '@o3r/rules-engine';
import { rulesetReportToHistory } from '@o3r/rules-engine';
import { map, Observable, ReplaySubject } from 'rxjs';
import {shareReplay} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RulesetHistoryService {
  private readonly ruleEngineDebugEventsSubject = new ReplaySubject<RulesEngineDebugEventsContentMessage>(1);

  /** Ruleset history stream */
  public readonly ruleEngineDebugEvents$ = this.ruleEngineDebugEventsSubject.asObservable();

  /**
   * History of ruleset executed
   */
  public readonly rulesetExecutions$: Observable<RulesetExecutionDebug[]> = this.ruleEngineDebugEvents$.pipe(
    map(({events, rulesetMap}) => rulesetReportToHistory(events, rulesetMap)),
    shareReplay({bufferSize: 1, refCount: true})
  );

  /**
   * Update the ruleset history
   * @param message Message from the background service
   */
  public update(message: RulesEngineDebugEventsContentMessage) {
    this.ruleEngineDebugEventsSubject.next(message);
  }
}
