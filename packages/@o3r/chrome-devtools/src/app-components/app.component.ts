import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import {
  getAnalyticEvents as devkitGetAnalyticEvents,
  getTranslations as devkitGetTranslations,
  getAnalyticEventsRec,
  getTranslationsRec,
  Ng,
  OtterLikeComponentInfo
} from '@o3r/components';
import type { ConfigurationModel } from '@o3r/configuration';
import type {
  OtterComponentInfo,
  otterComponentInfoPropertyName
} from '@o3r/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { filter, map, startWith } from 'rxjs/operators';
import { RulesetExecutionDebug, RulesetHistoryService } from '../components/rules-engine/ruleset-history/ruleset-history.service';
import { ChromeExtensionConnectionService } from '../services/connection.service';

const otterInfoPropertyName: typeof otterComponentInfoPropertyName = '__otter-info__';

function getO3rComponentInfo(componentInstance: any): OtterComponentInfo | undefined {
  return componentInstance[otterInfoPropertyName];
}

/**
 * Retrieve component information
 * of the component selected in the Elements panel of Chrome DevTools
 *
 * @param getTranslations Function to retrieve translations
 * @param getAnalyticEvents Function to retrieve analytic events
 */
function getSelectedComponentInfo(getTranslations: typeof devkitGetTranslations, getAnalyticEvents: typeof devkitGetAnalyticEvents): OtterLikeComponentInfo | undefined {
  const angularDevTools: Ng | undefined = (window as any).ng;
  const selectedElement = (window as any).$0;

  if (!angularDevTools || !selectedElement) {
    return;
  }

  let componentClassInstance = angularDevTools.getComponent(selectedElement) || angularDevTools.getOwningComponent(selectedElement);
  let info: OtterLikeComponentInfo | undefined;
  let compInfo: OtterComponentInfo | undefined;
  if (!componentClassInstance) {
    return;
  }
  do {
    compInfo = getO3rComponentInfo(componentClassInstance);
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
  return info;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  /** Configuration value stream */
  public config$: Observable<ConfigurationModel | undefined>;

  /** List of ruleset executions stream */
  public rulesetExecutions$: Observable<RulesetExecutionDebug[]>;

  private selectedComponentInfo = new BehaviorSubject<OtterLikeComponentInfo | undefined>(undefined);

  private updateSelectedComponentInfoCallback = this.updateSelectedComponentInfo.bind(this);

  public selectedComponentInfo$ = this.selectedComponentInfo.asObservable();

  constructor(
    connectionService: ChromeExtensionConnectionService,
    rulesetHistoryService: RulesetHistoryService,
    private cd: ChangeDetectorRef
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
      map(([info, executions]) => executions.filter((execution) => execution.rulesetInformation?.linkedComponent?.name === info.componentName))
    );
  }

  private requestSelectedComponentInfo() {
    chrome.devtools.inspectedWindow.eval<OtterLikeComponentInfo | undefined>(
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      `function getTranslations(node){ return (${getTranslationsRec})(node, getTranslations); } ` +
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      `function getAnalyticEvents(node){ return (${getAnalyticEventsRec})(node, getAnalyticEvents); } ` +
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      `(${getSelectedComponentInfo})(getTranslations, getAnalyticEvents);`,
      this.updateSelectedComponentInfoCallback
    );
  }

  private updateSelectedComponentInfo(info?: OtterLikeComponentInfo) {
    this.selectedComponentInfo.next(info);
    this.cd.detectChanges();
  }
}
