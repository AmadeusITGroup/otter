import {
  DestroyRef,
  inject,
  Injectable,
} from '@angular/core';
import {
  takeUntilDestroyed,
} from '@angular/core/rxjs-interop';
import {
  select,
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
  ConfigurationStore,
  selectConfigurationEntities,
} from '../stores';
import {
  AvailableConfigurationMessageContents,
  ConfigurationDevtoolsServiceOptions,
  ConfigurationMessageDataTypes,
  isConfigurationMessage,
} from './configuration-devtools.interface';
import {
  OtterConfigurationDevtools,
} from './configuration-devtools.service';
import {
  OTTER_CONFIGURATION_DEVTOOLS_DEFAULT_OPTIONS,
  OTTER_CONFIGURATION_DEVTOOLS_OPTIONS,
} from './configuration-devtools.token';

@Injectable({
  providedIn: 'root'
})
export class ConfigurationDevtoolsMessageService implements DevtoolsServiceInterface {
  private readonly store = inject<Store<ConfigurationStore>>(Store);
  private readonly logger = inject(LoggerService);
  private readonly configurationDevtools = inject(OtterConfigurationDevtools);
  private readonly options = inject<ConfigurationDevtoolsServiceOptions>(OTTER_CONFIGURATION_DEVTOOLS_OPTIONS, { optional: true });

  private readonly sendMessage = sendOtterMessage<AvailableConfigurationMessageContents>;
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    const options = this.options;

    this.options = { ...OTTER_CONFIGURATION_DEVTOOLS_DEFAULT_OPTIONS, ...options };

    if (this.options.isActivatedOnBootstrap) {
      this.activate();
    }
  }

  private async sendCurrentConfigurationState() {
    const configurations = await firstValueFrom(this.store.pipe(
      select(selectConfigurationEntities)
    ));
    this.sendMessage('configurations', { configurations });
  }

  /**
   * Function to trigger a re-send a requested messages to the Otter Chrome DevTools extension
   * @param only restricted list of messages to re-send
   */
  private handleReEmitRequest(only?: ConfigurationMessageDataTypes[]) {
    if (!only || only.includes('configurations')) {
      return this.sendCurrentConfigurationState();
    }
  }

  /**
   * Function to handle the incoming messages from Otter Chrome DevTools extension
   * @param message message coming from the Otter Chrome DevTools extension
   */
  private async handleEvents(message: AvailableConfigurationMessageContents) {
    this.logger.debug('Message handling by the configuration service', message);

    switch (message.dataType) {
      case 'connect': {
        await this.connectPlugin();
        break;
      }
      case 'requestMessages': {
        await this.handleReEmitRequest(message.only);
        break;
      }
      case 'updateConfig': {
        this.configurationDevtools.loadConfiguration([{
          name: message.id,
          config: message.configValue
        }]);
        break;
      }
      default: {
        this.logger.warn('Message ignored by the configuration service', message);
      }
    }
  }

  /**
   * Function to connect the plugin to the Otter DevTools extension
   */
  private connectPlugin() {
    this.logger.debug('Otter DevTools is plugged to configuration service of the application');
    return this.sendCurrentConfigurationState();
  }

  /** @inheritDoc */
  public activate() {
    fromEvent(window, 'message').pipe(
      takeUntilDestroyed(this.destroyRef),
      filterMessageContent(isConfigurationMessage)
    ).subscribe((e) => this.handleEvents(e));

    this.store.pipe(
      select(selectConfigurationEntities),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((configurations) => this.sendMessage('configurations', { configurations }));
  }
}
