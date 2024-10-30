/* eslint-disable no-console -- this is the purpose of this logger */
import type {
  Action,
  ActionReducer,
  MetaReducer
} from '@ngrx/store';
import type {
  LoggerClient
} from './logger.client';

/**
 * Console logger used to display the logs in the browser console
 * Should be used in development mode.
 */
export const noopLogger: LoggerClient = {
  identify: () => {},
  event: () => {},
  getSessionURL: () => undefined,
  stopRecording: () => {},
  resumeRecording: () => {},
  error: console.error,
  warn: console.warn,
  debug: console.debug,
  info: console.info,
  log: console.log,
  // eslint-disable-next-line unicorn/consistent-function-scoping -- higher-order function
  createMetaReducer: (): MetaReducer<any, Action> => (reducer: ActionReducer<any>): ActionReducer<any> => reducer
};
