import {
  AsyncPipe,
} from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  ViewEncapsulation,
} from '@angular/core';
import type {
  IsComponentSelectionAvailableMessage,
  OtterLikeComponentInfo,
} from '@o3r/components';
import {
  ConfigurationModel,
} from '@o3r/configuration';
import type {
  RulesetExecutionDebug,
} from '@o3r/rules-engine';
import {
  BehaviorSubject,
  combineLatest,
  Observable,
  Subscription,
} from 'rxjs';
import {
  filter,
  map,
  shareReplay,
  startWith,
} from 'rxjs/operators';
import {
  OtterComponentComponent,
} from '../../components/otter-component/otter-component.component';
import {
  ChromeExtensionConnectionService,
  isSelectedComponentInfoMessage,
} from '../../services/connection.service';
import {
  RulesetHistoryService,
} from '../../services/ruleset-history.service';

@Component({
  selector: 'o3r-component-panel-pres',
  templateUrl: './component-panel-pres.template.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    OtterComponentComponent,
    AsyncPipe
  ]
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

  /** Determines if the component selection is available */
  public isComponentSelectionAvailable$: Observable<boolean>;

  private readonly subscription: Subscription = new Subscription();

  constructor(
    private readonly connectionService: ChromeExtensionConnectionService,
    rulesetHistoryService: RulesetHistoryService,
    private readonly cd: ChangeDetectorRef
  ) {
    this.isComponentSelectionAvailable$ = connectionService.message$.pipe(
      filter((message): message is IsComponentSelectionAvailableMessage => message.dataType === 'isComponentSelectionAvailable'),
      map((data) => data.available),
      startWith(false)
    );
    const selectedComponentInfoMessage$ = connectionService.message$.pipe(filter(isSelectedComponentInfoMessage), shareReplay({ bufferSize: 1, refCount: true }));
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
      shareReplay({ bufferSize: 1, refCount: true })
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
      map(([info, executions]) =>
        executions.filter((execution) =>
          (execution.rulesetInformation?.linkedComponent?.name === info.componentName)
          || (execution.rulesetInformation?.linkedComponents?.or.some((linkedComp) => linkedComp.name === info.componentName))
        )
      )
    );
    this.connectionService.sendMessage(
      'requestMessages',
      { only: ['isComponentSelectionAvailable'] }
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
