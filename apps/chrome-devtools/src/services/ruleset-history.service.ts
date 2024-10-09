import { effect, inject, Injectable } from '@angular/core';
import type { RulesEngineDebugEventsContentMessage, RulesetExecutionDebug } from '@o3r/rules-engine';
import { rulesetReportToHistory } from '@o3r/rules-engine';
import { filter, map, Observable, ReplaySubject } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { ChromeExtensionConnectionService, isRuleEngineEventsMessage } from './connection.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root'
})
export class RulesetHistoryService {
  private readonly ruleEngineDebugEventsSubject = new ReplaySubject<RulesEngineDebugEventsContentMessage>(1);
  private readonly connectionService = inject(ChromeExtensionConnectionService);

  /** Ruleset history stream */
  public readonly ruleEngineDebugEvents$ = this.ruleEngineDebugEventsSubject.asObservable();

  /**
   * History of ruleset executed
   */
  public readonly rulesetExecutions$: Observable<RulesetExecutionDebug[]> = this.ruleEngineDebugEvents$.pipe(
    map(({events, rulesetMap}) => rulesetReportToHistory(events, rulesetMap)),
    shareReplay({bufferSize: 1, refCount: true})
  );

  constructor() {
    const extensionMessage = toSignal(this.connectionService.message$.pipe(filter(isRuleEngineEventsMessage)));
    effect(() => {
      const message = extensionMessage();
      if (message) {
        this.update(message);
      }
    });
  }

  /**
   * Update the ruleset history
   * @param message Message from the background service
   */
  public update(message: RulesEngineDebugEventsContentMessage) {
    this.ruleEngineDebugEventsSubject.next(message);
  }
}
