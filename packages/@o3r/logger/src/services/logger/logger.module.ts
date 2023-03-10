import { ModuleWithProviders, NgModule } from '@angular/core';
import { LoggerClient } from './logger.client';
import { ConsoleLogger } from './logger.console';
import { LoggerService } from './logger.service';
import { LOGGER_CLIENT_TOKEN } from './logger.token';

@NgModule({
  providers: [
    LoggerService
  ]
})
export class LoggerModule {
  public static forRoot(...clients: LoggerClient[]): ModuleWithProviders<LoggerModule> {
    if (clients.length < 1) {
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
