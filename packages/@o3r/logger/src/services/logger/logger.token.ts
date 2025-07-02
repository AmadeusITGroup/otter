import {
  InjectionToken,
} from '@angular/core';
import {
  LoggerClient,
} from './logger.client';

export const LOGGER_CLIENT_TOKEN: InjectionToken<LoggerClient | LoggerClient[]> = new InjectionToken('Logger Client injection token');
