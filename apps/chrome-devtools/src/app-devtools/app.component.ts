import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { type RulesetExecutionDebug, RulesetHistoryPresModule } from '@o3r/rules-engine';
import { Observable, Subscription } from 'rxjs';
import { AppConnectionComponent } from '../components/app-connection/app-connection.component';
import { ComponentPanelPresComponent } from './component-panel/component-panel-pres.component';
import { ChromeExtensionConnectionService, isApplicationInformationMessage } from '../services/connection.service';
import { RulesetHistoryService } from '../services/ruleset-history.service';
import { ConfigPanelPresComponent } from './config-panel/config-panel-pres.component';
import { DebugPanelPresComponent } from './debug-panel/debug-panel-pres.component';
import { DebugPanelService } from './debug-panel/debug-panel.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgbNavModule,
    DebugPanelPresComponent,
    RulesetHistoryPresModule,
    ConfigPanelPresComponent,
    ComponentPanelPresComponent,
    AppConnectionComponent,
    AsyncPipe
  ]
})
export class AppComponent implements OnDestroy {
  private readonly subscription = new Subscription();

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
