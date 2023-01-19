import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, ViewEncapsulation } from '@angular/core';
import type { OtterLikeComponentInfo } from '@o3r/components';
import { ConfigurationModel } from '@o3r/configuration';
import type { RulesetExecutionDebug } from '@o3r/rules-engine';
import { BehaviorSubject, combineLatest, Observable, Subscription } from 'rxjs';
import { filter, map, shareReplay, startWith } from 'rxjs/operators';
import { RulesetHistoryService } from '../../services/ruleset-history.service';
import { ChromeExtensionConnectionService, isSelectedComponentInfoMessage } from '../../services/connection.service';

@Component({
  selector: 'o3r-component-panel-pres',
  templateUrl: './component-panel-pres.template.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class ComponentPanelPresComponent implements OnDestroy {
  /** Stream of configuration value */
  public config$: Observable<ConfigurationModel | undefined>;

  /** Stream of the selected component information */
  public selectedComponentInfo$: Observable<OtterLikeComponentInfo | undefined>;

  /** Stream of a list of ruleset executions */
  public rulesetExecutions$: Observable<RulesetExecutionDebug[]>;

  /** Is the inspector running */
  public inspectorRunning = false;

  /** Is looking to container */
  public isLookingToContainer$ = new BehaviorSubject<boolean>(false);

  /** Determines if the selected component has a container */
  public hasContainer$: Observable<boolean>;

  private subscription: Subscription = new Subscription();

  constructor(
    private connectionService: ChromeExtensionConnectionService,
    rulesetHistoryService: RulesetHistoryService,
    private cd: ChangeDetectorRef
  ) {
    const selectedComponentInfoMessage$ = connectionService.message$.pipe(filter(isSelectedComponentInfoMessage), shareReplay(1));
    this.hasContainer$ = selectedComponentInfoMessage$.pipe(map((info) => !!info.container));
    this.subscription.add(
      selectedComponentInfoMessage$.subscribe((info) => {
        this.toggleInspector();
        this.isLookingToContainer$.next(!!info.container);
      })
    );
    this.selectedComponentInfo$ = combineLatest([
      selectedComponentInfoMessage$,
      this.isLookingToContainer$
    ]).pipe(
      map(([info, isLookingToContainer]) => isLookingToContainer ? info.container : info),
      shareReplay(1)
    );

    this.config$ = combineLatest([
      this.selectedComponentInfo$,
      this.connectionService.configurations$
    ]).pipe(
      map(([info, configs]) => info?.configId ? configs[info.configId] : undefined)
    );

    this.rulesetExecutions$ = combineLatest([
      this.selectedComponentInfo$.pipe(filter((info): info is OtterLikeComponentInfo => !!info)),
      rulesetHistoryService.rulesetExecutions$.pipe(startWith([]))
    ]).pipe(
      map(([info, executions]) => executions.filter((execution) => execution.rulesetInformation?.linkedComponent?.name === info.componentName))
    );
  }

  public toggleInspector() {
    this.inspectorRunning = !this.inspectorRunning;
    this.connectionService.sendMessage('toggleInspector', {
      isRunning: this.inspectorRunning
    });
    this.cd.detectChanges();
  }

  public toggleContainerPresenter() {
    this.isLookingToContainer$.next(!this.isLookingToContainer$.value);
    this.cd.detectChanges();
  }

  public ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
