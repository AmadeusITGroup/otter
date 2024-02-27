import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { Observable, of, Subscription } from 'rxjs';
import { catchError, map, startWith, take, timeout } from 'rxjs/operators';
import { ChromeExtensionConnectionService, isRuleEngineEventsMessage } from '../../services/connection.service';
import { RulesetHistoryService } from '../../services/ruleset-history.service';

type AppState = 'loading' | 'timeout' | 'connected';

@Component({
  selector: 'app-connection',
  templateUrl: './app-connection.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppConnectionComponent implements OnDestroy {
  /** Stream of application's state */
  public appState$: Observable<AppState>;

  private readonly subscription = new Subscription();

  constructor(
    connectionService: ChromeExtensionConnectionService,
    rulesetHistoryService: RulesetHistoryService
  ) {
    this.subscription.add(
      connectionService.message$.subscribe((message) => {
        if (isRuleEngineEventsMessage(message)) {
          rulesetHistoryService.update(message);
        }
      })
    );

    this.appState$ = connectionService.message$.pipe(
      map(() => 'connected' as AppState),
      take(1),
      startWith('loading' as AppState),
      timeout(3000),
      catchError(() => of('timeout' as AppState))
    );

    connectionService.activate();
  }

  /** @inheritDoc */
  public ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
