import {
  AsyncPipe,
} from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
} from '@angular/core';
import {
  getAnalyticEvents as devkitGetAnalyticEvents,
  getTranslations as devkitGetTranslations,
  getAnalyticEventsRec,
  getTranslationsRec,
  Ng,
  OtterLikeComponentInfo,
} from '@o3r/components';
import type {
  ConfigurationModel,
} from '@o3r/configuration';
import {
  otterComponentInfoPropertyName,
} from '@o3r/core';
import type {
  OtterComponentInfo,
} from '@o3r/core';
import type {
  RulesetExecutionDebug,
} from '@o3r/rules-engine';
import {
  BehaviorSubject,
  combineLatest,
  Observable,
} from 'rxjs';
import {
  filter,
  map,
  startWith,
} from 'rxjs/operators';
import {
  AppConnectionComponent,
} from '../components/app-connection/app-connection.component';
import {
  OtterComponentComponent,
} from '../components/otter-component/otter-component.component';
import {
  ChromeExtensionConnectionService,
} from '../services/connection.service';
import {
  RulesetHistoryService,
} from '../services/ruleset-history.service';

declare namespace window {
  let ng: Ng | undefined;
  let $0: Element | undefined;
}

/**
 * Retrieve component information
 * of the component selected in the Elements panel of Chrome DevTools
 * @param getTranslations Function to retrieve translations
 * @param getAnalyticEvents Function to retrieve analytic events
 */
function getSelectedComponentInfo(getTranslations: typeof devkitGetTranslations, getAnalyticEvents: typeof devkitGetAnalyticEvents): OtterLikeComponentInfo | undefined {
  const angularDevTools = window.ng;
  const selectedElement = window.$0;
  const o3rInfoProperty: typeof otterComponentInfoPropertyName = '__otter-info__';
  if (!angularDevTools || !selectedElement) {
    return;
  }
  /* eslint-disable @typescript-eslint/no-unsafe-argument -- expected type is `any` */
  let componentClassInstance = angularDevTools.getComponent(selectedElement) || angularDevTools.getOwningComponent(selectedElement);

  let info: OtterLikeComponentInfo | undefined;
  let compInfo: OtterComponentInfo | undefined;
  if (!componentClassInstance) {
    return;
  }
  do {
    compInfo = componentClassInstance[o3rInfoProperty] as OtterComponentInfo | undefined;
    if (compInfo) {
      info = {
        configId: compInfo.configId,
        componentName: compInfo.componentName,
        translations: getTranslations(angularDevTools.getHostElement(componentClassInstance)),
        analytics: getAnalyticEvents(angularDevTools.getHostElement(componentClassInstance))
      };
    } else {
      componentClassInstance = angularDevTools.getOwningComponent(componentClassInstance);
    }
  } while (!compInfo && componentClassInstance);
  /* eslint-enable-next-line @typescript-eslint/no-unsafe-assignment */

  return info;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    OtterComponentComponent,
    AppConnectionComponent,
    AsyncPipe
  ]
})
export class AppComponent {
  /** Configuration value stream */
  public config$: Observable<ConfigurationModel | undefined>;

  /** List of ruleset executions stream */
  public rulesetExecutions$: Observable<RulesetExecutionDebug[]>;

  private readonly selectedComponentInfo = new BehaviorSubject<OtterLikeComponentInfo | undefined>(undefined);

  private readonly updateSelectedComponentInfoCallback = this.updateSelectedComponentInfo.bind(this);

  public selectedComponentInfo$ = this.selectedComponentInfo.asObservable();

  constructor(
    connectionService: ChromeExtensionConnectionService,
    rulesetHistoryService: RulesetHistoryService,
    private readonly cd: ChangeDetectorRef
  ) {
    this.requestSelectedComponentInfo();

    chrome.devtools.panels.elements.onSelectionChanged.addListener(() => {
      this.requestSelectedComponentInfo();
    });

    this.config$ = combineLatest([
      this.selectedComponentInfo$,
      connectionService.configurations$
    ]).pipe(map(([info, configs]) => info?.configId ? configs[info.configId] : undefined));

    this.rulesetExecutions$ = combineLatest([
      this.selectedComponentInfo$.pipe(filter((info): info is OtterLikeComponentInfo => !!info)),
      rulesetHistoryService.rulesetExecutions$.pipe(startWith([]))
    ]).pipe(
      map(([info, executions]) =>
        executions.filter((execution) =>
          execution.rulesetInformation?.linkedComponents?.or.some((linkedComp) => linkedComp.name === info.componentName)
        )
      )
    );
  }

  private requestSelectedComponentInfo() {
    /* eslint-disable @typescript-eslint/restrict-template-expressions -- we want to print the content of the functions */
    chrome.devtools.inspectedWindow.eval<OtterLikeComponentInfo | undefined>(
      `function getTranslations(node){ return (${getTranslationsRec})(node, getTranslations); } `
      + `function getAnalyticEvents(node){ return (${getAnalyticEventsRec})(node, getAnalyticEvents); } `
      + `(${getSelectedComponentInfo})(getTranslations, getAnalyticEvents);`,
      this.updateSelectedComponentInfoCallback
    );
    /* eslint-enable @typescript-eslint/restrict-template-expressions */
  }

  private updateSelectedComponentInfo(info?: OtterLikeComponentInfo) {
    this.selectedComponentInfo.next(info);
    this.cd.detectChanges();
  }
}
