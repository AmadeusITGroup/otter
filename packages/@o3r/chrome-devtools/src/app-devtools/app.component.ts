import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { ChromeExtensionConnectionService, isApplicationInformationMessage } from '../services/connection.service';
import { DebugPanelService } from './debug-panel/debug-panel.service';
import { RulesetExecutionDebug, RulesetHistoryService } from '../components/rules-engine/ruleset-history/ruleset-history.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnDestroy {
  private subscription = new Subscription();

  public rulesetExecutions$: Observable<RulesetExecutionDebug[]>;

  constructor(
    connectionService: ChromeExtensionConnectionService,
    debugPanelService: DebugPanelService,
    rulesetHistoryService: RulesetHistoryService
  ) {
    this.rulesetExecutions$ = rulesetHistoryService.rulesetExecutions$;

    this.subscription.add(
      connectionService.message$.subscribe((message) => {
        if (isApplicationInformationMessage(message)) {
          debugPanelService.update(message);
        }
      })
    );
  }

  /** @inheritDoc */
  public ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
