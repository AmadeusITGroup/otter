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
  public static forRoot(client: LoggerClient = new ConsoleLogger()): ModuleWithProviders<LoggerModule> {
    return {
      ngModule: LoggerModule,
      providers: [
        {
          provide: LOGGER_CLIENT_TOKEN,
          useValue: client,
          multi: false
        }
      ]
    };
  }
}
