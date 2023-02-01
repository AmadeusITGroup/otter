import { Inject, Injectable, OnDestroy, Optional } from '@angular/core';
import { DevtoolsServiceInterface, filterMessageContent, sendOtterMessage } from '@o3r/core';
import { LoggerService } from '@o3r/logger';
import { firstValueFrom, fromEvent, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AvailableComponentsMessageContents, ComponentsDevtoolsServiceOptions, ComponentsMessageDataTypes, isComponentsMessage } from './components-devkit.interface';
import { OTTER_COMPONENTS_DEVTOOLS_DEFAULT_OPTIONS, OTTER_COMPONENTS_DEVTOOLS_OPTIONS } from './components-devtools.token';
import { OtterInspectorService, OtterLikeComponentInfo } from './inspector';

@Injectable({
  providedIn: 'root'
})
export class ComponentsDevtoolsMessageService implements OnDestroy, DevtoolsServiceInterface {
  private readonly options: ComponentsDevtoolsServiceOptions;

  private subscriptions = new Subscription();
  private inspectorService: OtterInspectorService;

  private sendMessage = sendOtterMessage<AvailableComponentsMessageContents>;

  constructor(
      private logger: LoggerService,
      @Optional() @Inject(OTTER_COMPONENTS_DEVTOOLS_OPTIONS) options?: ComponentsDevtoolsServiceOptions) {
    this.options = {
      ...OTTER_COMPONENTS_DEVTOOLS_DEFAULT_OPTIONS,
      ...options
    };

    this.inspectorService = new OtterInspectorService();
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

  /**
   * Function to trigger a re-send a requested messages to the Otter Chrome DevTools extension
   *
   * @param only restricted list of messages to re-send
   */
  private handleReEmitRequest(only?: ComponentsMessageDataTypes[]) {
    if (!only || only.includes('selectedComponentInfo')) {
      void this.sendCurrentSelectedComponent();
    }
  }

  /**
   * Function to handle the incoming messages from Otter Chrome DevTools extension
   *
   * @param event Event coming from the Otter Chrome DevTools extension
   * @param message
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
      default: {
        this.logger.warn('Message ignored by the components service', message);
      }
    }
  }

  /** @inheritDoc */
  public activate() {
    this.subscriptions.add(
      fromEvent(window, 'message').pipe(filterMessageContent(isComponentsMessage)).subscribe((e) => this.handleEvents(e))
    );

    this.inspectorService.prepareInspector();
    this.subscriptions.add(
      this.inspectorService.otterLikeComponentInfoToBeSent$
        .pipe(
          filter((info): info is OtterLikeComponentInfo => !!info)
        ).subscribe(
          (info) => this.sendMessage('selectedComponentInfo', info)
        )
    );
  }

  /** @inheritDoc */
  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
