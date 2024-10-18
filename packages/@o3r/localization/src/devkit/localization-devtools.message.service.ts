import {
  Inject,
  Injectable,
  OnDestroy,
  Optional
} from '@angular/core';
import {
  filterMessageContent,
  sendOtterMessage
} from '@o3r/core';
import {
  LoggerService
} from '@o3r/logger';
import {
  firstValueFrom,
  fromEvent,
  Subscription
} from 'rxjs';
import {
  LocalizationService
} from '../tools';
import {
  type AvailableLocalizationMessageContents,
  LocalizationDevtoolsServiceOptions,
  type LocalizationMessageDataTypes
} from './localization-devkit.interface';
import {
  OtterLocalizationDevtools
} from './localization-devtools.service';
import {
  OTTER_LOCALIZATION_DEVTOOLS_DEFAULT_OPTIONS,
  OTTER_LOCALIZATION_DEVTOOLS_OPTIONS
} from './localization-devtools.token';

const isLocalizationMessage = (message: any): message is AvailableLocalizationMessageContents => {
  return message && (
    message.dataType === 'displayLocalizationKeys'
    || message.dataType === 'languages'
    || message.dataType === 'switchLanguage'
    || message.dataType === 'localizations'
    || message.dataType === 'updateLocalization'
    || message.dataType === 'requestMessages'
    || message.dataType === 'connect'
    || message.dataType === 'reloadLocalizationKeys'
    || message.dataType === 'isTranslationDeactivationEnabled'
    || message.dataType === 'getTranslationValuesContentMessage'
  );
};

@Injectable()
export class LocalizationDevtoolsMessageService implements OnDestroy {
  private readonly subscriptions = new Subscription();

  private readonly sendMessage = sendOtterMessage<AvailableLocalizationMessageContents>;

  constructor(
    private readonly logger: LoggerService,
    private readonly localizationDevTools: OtterLocalizationDevtools,
    private readonly localizationService: LocalizationService,
    @Optional() @Inject(OTTER_LOCALIZATION_DEVTOOLS_OPTIONS) private readonly options: LocalizationDevtoolsServiceOptions = OTTER_LOCALIZATION_DEVTOOLS_DEFAULT_OPTIONS
  ) {
    this.options = {
      ...OTTER_LOCALIZATION_DEVTOOLS_DEFAULT_OPTIONS,
      ...this.options
    };
    if (this.options.isActivatedOnBootstrap) {
      this.activate();
    }
  }

  private async sendLocalizationsMetadata() {
    const metadata = await (await fetch(this.options.metadataFilePath)).json();
    this.sendMessage('localizations', {
      localizations: metadata
    });
  }

  /**
   * Function to trigger a re-send a requested messages to the Otter Chrome DevTools extension
   * @param only restricted list of messages to re-send
   */
  private async handleReEmitRequest(only?: LocalizationMessageDataTypes[]) {
    if (!only || only.includes('localizations')) {
      void this.sendLocalizationsMetadata();
    }
    if (!only || only.includes('switchLanguage')) {
      this.sendMessage('switchLanguage', { language: this.localizationDevTools.getCurrentLanguage() });
    }
    if (!only || only.includes('languages')) {
      this.sendMessage('languages', { languages: this.localizationService.getLanguages() });
    }
    if (!only || only.includes('getTranslationValuesContentMessage')) {
      this.sendMessage('getTranslationValuesContentMessage', {
        translations: await firstValueFrom(this.localizationService.getTranslateService().getTranslation(this.localizationService.getCurrentLanguage()))
      });
    }
    if (!only || only.includes('isTranslationDeactivationEnabled')) {
      this.sendMessage('isTranslationDeactivationEnabled', { enabled: this.localizationService.isTranslationDeactivationEnabled() });
    }
  }

  /**
   * Function to handle the incoming messages from Otter Chrome DevTools extension
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
      case 'requestMessages': {
        void this.handleReEmitRequest(message.only);
        break;
      }
      case 'switchLanguage': {
        void this.localizationDevTools.switchLanguage(message.language);
        break;
      }
      case 'updateLocalization': {
        void this.localizationDevTools.updateLocalizationKeys({
          [message.key]: message.value
        }, message.lang);
        break;
      }
      case 'reloadLocalizationKeys': {
        void this.localizationDevTools.reloadLocalizationKeys(message.lang);
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
      fromEvent(window, 'message').pipe(filterMessageContent(isLocalizationMessage)).subscribe((e) => this.handleEvents(e))
    );
  }

  /** @inheritDoc */
  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
