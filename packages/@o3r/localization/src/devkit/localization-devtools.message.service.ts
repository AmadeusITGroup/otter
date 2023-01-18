import { Inject, Injectable, OnDestroy, Optional } from '@angular/core';
import { filterMessageContent } from '@o3r/core';
import { LoggerService } from '@o3r/logger';
import { fromEvent, Subscription } from 'rxjs';
import { AvailableLocalizationMessageContents, LocalizationDevtoolsServiceOptions } from './localization-devkit.interface';
import { OtterLocalizationDevtools } from './localization-devtools.service';
import { OTTER_LOCALIZATION_DEVTOOLS_DEFAULT_OPTIONS, OTTER_LOCALIZATION_DEVTOOLS_OPTIONS } from './localization-devtools.token';

const isLocalizationMessage = (message: any): message is AvailableLocalizationMessageContents => {
  return message && message.dataType === 'displayLocalizationKeys';
};

@Injectable()
export class LocalizationDevtoolsMessageService implements OnDestroy {

  private subscriptions = new Subscription();

  constructor(
      private logger: LoggerService,
      private localizationDevTools: OtterLocalizationDevtools,
    @Optional() @Inject(OTTER_LOCALIZATION_DEVTOOLS_OPTIONS) private options: LocalizationDevtoolsServiceOptions = OTTER_LOCALIZATION_DEVTOOLS_DEFAULT_OPTIONS) {

    if (this.options.isActivatedOnBootstrap) {
      this.activate();
    }
  }

  /**
   * Function to handle the incoming messages from Otter Chrome DevTools extension
   *
   * @param event Event coming from the Otter Chrome DevTools extension
   * @param message
   */
  private handleEvents(message: AvailableLocalizationMessageContents) {
    this.logger.debug('Message handling by the localization service', message);

    switch (message.dataType) {
      case 'connect': {
        this.connectPlugin();
        break;
      }
      case 'displayLocalizationKeys': {
        this.localizationDevTools.showLocalizationKeys(message.toggle);
        break;
      }
      default: {
        this.logger.warn('Message ignored by the localization service', message);
      }
    }
  }

  /**
   * Function to connect the plugin to the Otter Chrome DevTools extension
   */
  private connectPlugin() {
    this.logger.debug('Otter DevTools is plugged to localization service of the application');
  }

  /** @inheritDoc */
  public activate() {
    this.subscriptions.add(
      fromEvent(window, 'message').pipe(filterMessageContent(isLocalizationMessage)).subscribe(this.handleEvents)
    );
  }

  /** @inheritDoc */
  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
