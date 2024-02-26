import { Inject, Injectable, OnDestroy, Optional } from '@angular/core';
import { DevtoolsServiceInterface, filterMessageContent, sendOtterMessage } from '@o3r/core';
import { LoggerService } from '@o3r/logger';
import { isVisualTestingEnabled, prepareVisualTesting,toggleVisualTestingRender } from '@o3r/testing/visual-test/utils';
import { fromEvent, Subscription } from 'rxjs';
import { ApplicationDevtoolsServiceOptions, ApplicationMessageDataTypes, AvailableApplicationMessageContents, isApplicationMessage } from './application-devkit.interface';
import { OtterApplicationDevtools } from './application-devtools.service';
import { OTTER_APPLICATION_DEVTOOLS_DEFAULT_OPTIONS, OTTER_APPLICATION_DEVTOOLS_OPTIONS } from './application-devtools.token';

@Injectable({
  providedIn: 'root'
})
export class ApplicationDevtoolsMessageService implements OnDestroy, DevtoolsServiceInterface {
  private readonly options: ApplicationDevtoolsServiceOptions;

  private readonly subscriptions = new Subscription();

  private readonly sendMessage = sendOtterMessage<AvailableApplicationMessageContents>;

  constructor(
      private readonly logger: LoggerService,
      private readonly applicationDevtools: OtterApplicationDevtools,
      @Optional() @Inject(OTTER_APPLICATION_DEVTOOLS_OPTIONS) options?: ApplicationDevtoolsServiceOptions) {
    this.options = {
      ...OTTER_APPLICATION_DEVTOOLS_DEFAULT_OPTIONS,
      ...options
    };

    if (this.options.isActivatedOnBootstrap) {
      this.activate();
    }
  }

  private sendApplicationInformation() {
    this.sendMessage('applicationInformation', this.applicationDevtools.getApplicationInformation());
  }

  /**
   * Function to connect the plugin to the Otter DevTools extension
   */
  private connectPlugin() {
    this.logger.debug('Otter DevTools is plugged to application service of the application');
    void this.sendApplicationInformation();
  }

  /**
   * Function to trigger a re-send a requested messages to the Otter Chrome DevTools extension
   * @param only restricted list of messages to re-send
   */
  private handleReEmitRequest(only?: ApplicationMessageDataTypes[]) {
    if (!only || only.includes('applicationInformation')) {
      this.sendApplicationInformation();
    }
  }

  /**
   * Function to handle the incoming messages from Otter Chrome DevTools extension
   * @param event Event coming from the Otter Chrome DevTools extension
   * @param message
   */
  private handleEvents(message: AvailableApplicationMessageContents) {
    this.logger.debug('Message handling by the application service', message);

    switch (message.dataType) {
      case 'connect': {
        this.connectPlugin();
        break;
      }
      case 'requestMessages': {
        this.handleReEmitRequest(message.only);
        break;
      }
      case 'toggleVisualTesting': {
        this.toggleVisualTestingRender(message.toggle);
        break;
      }
      default: {
        this.logger.warn('Message ignored by the application service', message);
      }
    }
  }

  /**
   * Toggle visual testing rendering
   * @param enabled activate or deactivate the visual testing mode
   */
  private toggleVisualTestingRender(enabled?: boolean) {
    toggleVisualTestingRender(enabled === undefined ? !isVisualTestingEnabled() : enabled);
  }

  /** @inheritDoc */
  public activate() {
    this.subscriptions.add(
      fromEvent(window, 'message').pipe(filterMessageContent(isApplicationMessage)).subscribe((e) => this.handleEvents(e))
    );
    prepareVisualTesting(this.options.e2eIgnoreClass);
  }

  /** @inheritDoc */
  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
