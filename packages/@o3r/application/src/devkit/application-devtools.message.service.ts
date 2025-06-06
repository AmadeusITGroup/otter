import {
  DOCUMENT,
} from '@angular/common';
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
  DevtoolsServiceInterface,
  filterMessageContent,
  sendOtterMessage,
} from '@o3r/core';
import {
  LoggerService,
} from '@o3r/logger';
import {
  fromEvent,
} from 'rxjs';
import {
  type ApplicationDevtoolsServiceOptions,
  type ApplicationMessageDataTypes,
  type AvailableApplicationMessageContents,
  isApplicationMessage,
  type StateSelectionContentMessage,
} from './application-devkit.interface';
import {
  OtterApplicationDevtools,
} from './application-devtools.service';
import {
  OTTER_APPLICATION_DEVTOOLS_DEFAULT_OPTIONS,
  OTTER_APPLICATION_DEVTOOLS_OPTIONS,
} from './application-devtools.token';

const OTTER_STATE_RIBBON_ID = 'otter-devtools-state-ribbon';

@Injectable({
  providedIn: 'root'
})
export class ApplicationDevtoolsMessageService implements DevtoolsServiceInterface {
  private readonly document = inject(DOCUMENT);
  private readonly options: ApplicationDevtoolsServiceOptions;
  private readonly sendMessage = sendOtterMessage<AvailableApplicationMessageContents>;
  private readonly destroyRef = inject(DestroyRef);

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
   * @param message
   */
  private async handleEvents(message: AvailableApplicationMessageContents) {
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
        await this.toggleVisualTestingRender(message.toggle);
        break;
      }
      case 'stateSelection': {
        this.onStateSelection(message);
        break;
      }
      case 'unselectState': {
        this.unselectState();
        break;
      }
      default: {
        this.logger.warn('Message ignored by the application service', message);
      }
    }
  }

  private unselectState() {
    const ribbonElement = this.document.body.querySelector<HTMLDivElement>(`#${OTTER_STATE_RIBBON_ID}`);
    if (ribbonElement) {
      ribbonElement.remove();
    }
  }

  private onStateSelection(message: StateSelectionContentMessage) {
    let ribbonElement = this.document.body.querySelector<HTMLDivElement>(`#${OTTER_STATE_RIBBON_ID}`);
    if (!ribbonElement) {
      ribbonElement = this.document.createElement('div');
      ribbonElement.id = OTTER_STATE_RIBBON_ID;
      this.document.body.append(ribbonElement);
    }
    if (message.stateName) {
      ribbonElement.innerHTML = message.stateName;
      ribbonElement.style.background = message.stateColor;
      ribbonElement.style.color = message.stateColorContrast;
      ribbonElement.style.position = 'fixed';
      ribbonElement.style.bottom = '0';
      ribbonElement.style.right = '0';
      ribbonElement.style.transform = 'translate(calc(100% * (1 - cos(45deg)))) rotate(-45deg)';
      ribbonElement.style.transformOrigin = 'bottom left';
      ribbonElement.style.clipPath = 'inset(0 -100%)';
      ribbonElement.style.boxShadow = `0px 0px 0px 999px ${message.stateColor}`;
    } else {
      ribbonElement.style.display = 'none';
    }
  }

  /**
   * Toggle visual testing rendering
   * @param enabled activate or deactivate the visual testing mode
   */
  private async toggleVisualTestingRender(enabled?: boolean) {
    try {
      const visualTestUtils = await import('@o3r/testing/visual-test/utils');
      const isEnabled = enabled ?? visualTestUtils.isVisualTestingEnabled();
      visualTestUtils.toggleVisualTestingRender(isEnabled);
    } catch (err) {
      this.logger.warn('Visual testing utilities are not available:', err);
    }
  }

  /** @inheritDoc */
  public activate() {
    fromEvent(window, 'message').pipe(
      takeUntilDestroyed(this.destroyRef),
      filterMessageContent(isApplicationMessage)
    ).subscribe((e) => this.handleEvents(e));
    import('@o3r/testing/visual-test/utils')
      .then((visualTestUtils) => visualTestUtils.prepareVisualTesting(this.options.e2eIgnoreClass))
      .catch((err) => this.logger.warn('Visual testing utilities are not available:', err));
    this.sendApplicationInformation();
  }
}
