import { BehaviorSubject, Observable } from 'rxjs';
import { Ng } from './ng';
import { getOtterLikeComponentInfo, INSPECTOR_CLASS, isContainer, OtterLikeComponentInfo } from './otter-inspector.helpers';


interface ComponentInfo extends OtterLikeComponentInfo {
  component: any;
  host: Element;
}

/**
 * Service to handle the custom inspector for the Otter Devtools Chrome extension.
 */
export class OtterInspectorService {
  private angularDevTools: Ng | undefined;
  private elementMouseOverCallback = this.elementMouseOver.bind(this);
  private elementClickCallback = this.elementClick.bind(this);
  private cancelEventCallback = this.cancelEvent.bind(this);
  private selectedComponent: ComponentInfo | undefined;
  private inspectorDiv: HTMLDivElement | null = null;
  private otterLikeComponentInfoToBeSent = new BehaviorSubject<OtterLikeComponentInfo | undefined>(undefined);

  /**
   * Stream of component info to be sent to the extension app.
   */
  public otterLikeComponentInfoToBeSent$: Observable<OtterLikeComponentInfo | undefined> = this.otterLikeComponentInfoToBeSent.asObservable();

  constructor() {
    this.angularDevTools = (window as any).ng as Ng | undefined;
  }

  private startInspecting() {
    window.addEventListener('mouseover', this.elementMouseOverCallback, true);
    window.addEventListener('click', this.elementClickCallback, true);
    window.addEventListener('mouseout', this.cancelEventCallback, true);
  }

  private elementClick(e: MouseEvent) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    e.preventDefault();
    if (!this.selectedComponent || !this.angularDevTools) {
      return;
    }
    const parentElement = this.selectedComponent.host.parentElement;
    const parent = parentElement && (this.angularDevTools.getComponent(parentElement) || this.angularDevTools.getOwningComponent(parentElement));
    const parentHost = parent && this.angularDevTools.getHostElement(parent);
    const container = isContainer(parentHost)
      ? getOtterLikeComponentInfo(parent, parentHost)
      : undefined;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { component, host, ...infoToBeSent} = this.selectedComponent;

    this.otterLikeComponentInfoToBeSent.next({
      ...infoToBeSent,
      container
    });
  }

  private isOtterLikeComponent(info: OtterLikeComponentInfo) {
    const hasConfigId = !!info.configId;
    const hasTranslations = !!info.translations?.length;
    const hasAnalytics = !!Object.keys(info.analytics || {}).length;
    return hasConfigId || hasTranslations || hasAnalytics;
  }

  private findComponentInfo(node: Element): ComponentInfo | undefined {
    if (!this.angularDevTools) {
      return;
    }
    let componentClassInstance = this.angularDevTools.getComponent(node) || this.angularDevTools.getOwningComponent(node);
    let o3rLikeComponentInfo: OtterLikeComponentInfo;
    let isO3rLike: boolean;
    if (!componentClassInstance) {
      return;
    }
    do {
      o3rLikeComponentInfo = getOtterLikeComponentInfo(componentClassInstance, this.angularDevTools.getHostElement(componentClassInstance));
      isO3rLike = this.isOtterLikeComponent(o3rLikeComponentInfo);
      if (!isO3rLike) {
        componentClassInstance = this.angularDevTools.getOwningComponent(componentClassInstance);
      }
    } while (!isO3rLike && componentClassInstance);
    if (isO3rLike) {
      return {
        component: componentClassInstance,
        host: this.angularDevTools.getHostElement(componentClassInstance),
        ...o3rLikeComponentInfo
      };
    }
  }

  private elementMouseOver(e: MouseEvent) {
    this.cancelEvent(e);

    const el = e.target as Element | undefined;

    if (el) {
      const selectedComponent = this.findComponentInfo(el);
      if (selectedComponent?.host !== this.selectedComponent?.host) {
        this.unHighlight();
        this.highlight(selectedComponent);
      }
    }
  }

  private highlight(selectedComponent: ComponentInfo | undefined) {
    this.selectedComponent = selectedComponent;
    if (this.selectedComponent?.host && this.inspectorDiv) {
      const rect = this.selectedComponent.host.getBoundingClientRect();
      this.inspectorDiv.style.width = `${rect.width}px`;
      this.inspectorDiv.style.height = `${rect.height}px`;
      this.inspectorDiv.style.top = `${rect.top}px`;
      this.inspectorDiv.style.left = `${rect.left}px`;
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      this.inspectorDiv.firstChild!.textContent = `<${this.selectedComponent.component.constructor.name}>`;
    }
  }

  private unHighlight() {
    if (this.selectedComponent?.host && this.inspectorDiv) {
      this.inspectorDiv.style.width = '0';
      this.inspectorDiv.style.height = '0';
      this.inspectorDiv.style.top = '0';
      this.inspectorDiv.style.left = '0';
    }
    this.selectedComponent = undefined;
  }

  private cancelEvent(e: MouseEvent): void {
    e.stopPropagation();
    e.stopImmediatePropagation();
    e.preventDefault();
  }

  /**
   * Prepare the inspector div and add it to the DOM.
   */
  public prepareInspector() {
    if (this.inspectorDiv) {
      return;
    }
    const inspectorCss = document.createElement('style');
    inspectorCss.textContent = `
      .${INSPECTOR_CLASS} {
        z-index: 9999999;
        width: 0;
        height: 0;
        background: rgba(104, 182, 255, 0.35);
        position: fixed;
        left: 0;
        top: 0;
        pointer-events: none;
      }

      .${INSPECTOR_CLASS} > span {
        bottom: -25px;
        position: absolute;
        right: 10px;
        background: rgba(104, 182, 255, 0.9);;
        padding: 5px;
        border-radius: 5px;
        color: white;
      }`;

    const inspectorDiv = document.createElement('div');
    const inspectorSpan = document.createElement('span');
    inspectorDiv.appendChild(inspectorSpan);
    inspectorDiv.classList.add(INSPECTOR_CLASS);

    document.head.appendChild(inspectorCss);
    this.inspectorDiv = document.body.appendChild(inspectorDiv);
  }

  /**
   * Toggle the inspector.
   *
   * @param isRunning true if the inspector is running
   */
  public toggleInspector(isRunning: boolean) {
    if (isRunning) {
      this.startInspecting();
    } else {
      this.stopInspecting();
    }
  }

  public stopInspecting() {
    this.unHighlight();
    window.removeEventListener('mouseover', this.elementMouseOverCallback, true);
    window.removeEventListener('click', this.elementClickCallback, true);
    window.removeEventListener('mouseout', this.cancelEventCallback, true);
  }
}
