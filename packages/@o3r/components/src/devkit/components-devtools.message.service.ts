import {
  DestroyRef,
  inject,
  Inject,
  Injectable,
  Optional,
} from '@angular/core';
import {
  takeUntilDestroyed,
} from '@angular/core/rxjs-interop';
import {
  Store,
} from '@ngrx/store';
import {
  DevtoolsServiceInterface,
  filterMessageContent,
  sendOtterMessage,
} from '@o3r/core';
import {
  LoggerService,
} from '@o3r/logger';
import {
  firstValueFrom,
  fromEvent,
} from 'rxjs';
import {
  filter,
} from 'rxjs/operators';
import {
  type PlaceholderTemplateState,
  togglePlaceholderModeTemplate,
} from '../stores';
import {
  AvailableComponentsMessageContents,
  ComponentsDevtoolsServiceOptions,
  ComponentsMessageDataTypes,
  isComponentsMessage,
} from './components-devkit.interface';
import {
  OTTER_COMPONENTS_DEVTOOLS_DEFAULT_OPTIONS,
  OTTER_COMPONENTS_DEVTOOLS_OPTIONS,
} from './components-devtools.token';
import {
  HighlightService,
} from './highlight/highlight.service';
import {
  OtterInspectorService,
  OtterLikeComponentInfo,
} from './inspector';

@Injectable({
  providedIn: 'root'
})
export class ComponentsDevtoolsMessageService implements DevtoolsServiceInterface {
  private readonly options: ComponentsDevtoolsServiceOptions;
  private readonly inspectorService: OtterInspectorService;
  private readonly highlightService: HighlightService;
  private readonly sendMessage = sendOtterMessage<AvailableComponentsMessageContents>;
  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private readonly logger: LoggerService,
    private readonly store: Store<PlaceholderTemplateState>,
    @Optional() @Inject(OTTER_COMPONENTS_DEVTOOLS_OPTIONS) options?: ComponentsDevtoolsServiceOptions
  ) {
    this.options = {
      ...OTTER_COMPONENTS_DEVTOOLS_DEFAULT_OPTIONS,
      ...options
    };

    this.inspectorService = new OtterInspectorService();
    this.highlightService = new HighlightService();

    if (this.options.isActivatedOnBootstrap) {
      this.activate();
    }
  }

  /**
   * Function to connect the plugin to the Otter DevTools extension
   */
  private async connectPlugin() {
    this.logger.debug('Otter DevTools is plugged to components service of the application');
    const selectComponentInfo = await firstValueFrom(this.inspectorService.otterLikeComponentInfoToBeSent$);
    if (selectComponentInfo) {
      await this.sendCurrentSelectedComponent();
    }
  }

  private async sendCurrentSelectedComponent() {
    const selectComponentInfo = await firstValueFrom(this.inspectorService.otterLikeComponentInfoToBeSent$);
    if (selectComponentInfo) {
      this.sendMessage('selectedComponentInfo', selectComponentInfo);
    }
  }

  private sendIsComponentSelectionAvailable() {
    this.sendMessage('isComponentSelectionAvailable', { available: !!(window as any).ng });
  }

  /**
   * Function to trigger a re-send a requested messages to the Otter Chrome DevTools extension
   * @param only restricted list of messages to re-send
   */
  private handleReEmitRequest(only?: ComponentsMessageDataTypes[]) {
    if (!only) {
      void this.sendCurrentSelectedComponent();
      this.sendIsComponentSelectionAvailable();
      return;
    }
    if (only.includes('selectedComponentInfo')) {
      void this.sendCurrentSelectedComponent();
    }
    if (only.includes('isComponentSelectionAvailable')) {
      this.sendIsComponentSelectionAvailable();
    }
  }

  /**
   * Function to handle the incoming messages from Otter Chrome DevTools extension
   * @param message message coming from the Otter Chrome DevTools extension
   */
  private async handleEvents(message: AvailableComponentsMessageContents) {
    this.logger.debug('Message handling by the components service', message);

    switch (message.dataType) {
      case 'connect': {
        await this.connectPlugin();
        break;
      }
      case 'requestMessages': {
        this.handleReEmitRequest(message.only);
        break;
      }
      case 'toggleInspector': {
        this.inspectorService.toggleInspector(message.isRunning);
        break;
      }
      case 'toggleHighlight': {
        if (message.isRunning) {
          this.highlightService.start();
        } else {
          this.highlightService.stop();
        }
        break;
      }
      case 'changeHighlightConfiguration': {
        if (message.elementMinWidth) {
          this.highlightService.elementMinWidth = message.elementMinWidth;
        }
        if (message.elementMinHeight) {
          this.highlightService.elementMinHeight = message.elementMinHeight;
        }
        if (message.throttleInterval) {
          this.highlightService.throttleInterval = message.throttleInterval;
        }
        if (message.groupsInfo) {
          this.highlightService.groupsInfo = message.groupsInfo;
        }
        if (message.maxDepth) {
          this.highlightService.maxDepth = message.maxDepth;
        }
        if (this.highlightService.isRunning()) {
          // Re-start to recompute the highlight with the new configuration
          this.highlightService.start();
        }
        break;
      }
      case 'placeholderMode': {
        this.store.dispatch(togglePlaceholderModeTemplate({ mode: message.mode }));
        break;
      }
      default: {
        this.logger.warn('Message ignored by the components service', message);
      }
    }
  }

  /** @inheritDoc */
  public activate() {
    fromEvent(window, 'message').pipe(takeUntilDestroyed(this.destroyRef), filterMessageContent(isComponentsMessage)).subscribe((e) => this.handleEvents(e));

    this.inspectorService.prepareInspector();
    this.inspectorService.otterLikeComponentInfoToBeSent$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        filter((info): info is OtterLikeComponentInfo => !!info)
      ).subscribe(
        (info) => this.sendMessage('selectedComponentInfo', info)
      );
  }
}
