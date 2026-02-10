import {
  makeEnvironmentProviders,
} from '@angular/core';
import {
  LoggerClient,
} from './logger-client';
import {
  ConsoleLogger,
} from './logger-console';
import {
  LoggerService,
} from './logger-service';
import {
  LOGGER_CLIENT_TOKEN,
} from './logger-token';

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
