import {
  makeEnvironmentProviders,
  ModuleWithProviders,
  NgModule,
} from '@angular/core';
import {
  LoggerClient,
} from './logger.client';
import {
  ConsoleLogger,
} from './logger.console';
import {
  LoggerService,
} from './logger.service';
import {
  LOGGER_CLIENT_TOKEN,
} from './logger.token';

/**
 * @deprecated will be removed in v14.
 */
@NgModule({
  providers: [
    LoggerService
  ]
})
export class LoggerModule {
  /**
   * Provide logger at application level
   * By default {@link ConsoleLogger} will be used if nothing is specified
   * @param {...any} clients Registered {@link https://github.com/AmadeusITGroup/otter/blob/main/docs/logger/LOGS.md | Logger Client}
   * @deprecated Please use {@link provideLogger} instead, will be removed in v14.
   */
  public static forRoot(...clients: LoggerClient[]): ModuleWithProviders<LoggerModule> {
    if (clients.length === 0) {
      clients = [new ConsoleLogger()];
    }
    return {
      ngModule: LoggerModule,
      providers: [
        {
          provide: LOGGER_CLIENT_TOKEN,
          useValue: clients,
          multi: false
        }
      ]
    };
  }
}

/**
 * Provide logger for the application
 * By default {@link ConsoleLogger} will be used if nothing is specified
 * @param clients Registered {@link https://github.com/AmadeusITGroup/otter/blob/main/docs/logger/LOGS.md | Logger Client}
 */
export function provideLogger(...clients: LoggerClient[]) {
  if (clients.length === 0) {
    clients = [new ConsoleLogger()];
  }
  return makeEnvironmentProviders([
    LoggerService,
    {
      provide: LOGGER_CLIENT_TOKEN,
      useValue: clients,
      multi: false
    }
  ]);
}
