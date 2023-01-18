/* eslint-disable no-console */
import { Action, ActionReducer, MetaReducer } from '@ngrx/store';
import { LoggerClient } from './logger.client';

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
  createMetaReducer: (): MetaReducer<any, Action> => (reducer: ActionReducer<any>): ActionReducer<any> => reducer
};
