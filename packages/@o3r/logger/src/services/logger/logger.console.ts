/* eslint-disable no-console */
import { Action, ActionReducer, MetaReducer } from '@ngrx/store';
import { LoggerClient } from './logger.client';

/**
 * Console logger used to display the logs in the browser console
 * Should be used in development mode.
 */
export class ConsoleLogger implements LoggerClient {
  /** @inheritdoc */
  public error = console.error;

  /** @inheritdoc */
  public warn = console.warn;

  /** @inheritdoc */
  public debug = console.debug;

  /** @inheritdoc */
  public info = console.info;

  /** @inheritdoc */
  public log = console.log;

  /** @inheritdoc */
  public identify(uuid: string) {
    this.debug('logging identify function called');
    this.log(`Identify userd ${uuid}`);
  }

  /** @inheritdoc */
  public event(name: string, properties?: any) {
    this.debug('logging event function called');
    this.log('event:', name);
    if (properties) {
      this.log('properties:', properties);
    }
  }

  /** @inheritdoc */
  public getSessionURL(): undefined {
    this.debug('logging getSessionURL function called');
    return undefined;
  }

  /** @inheritdoc */
  public stopRecording() {
    this.debug('logging stopRecording function called');
  }

  /** @inheritdoc */
  public resumeRecording() {
    this.debug('logging resumeRecording function called');
  }

  /** @inheritdoc */
  public createMetaReducer(): MetaReducer<any, Action> {
    this.debug('logging createMetaReducer function called but a noop reducer is returned for the console logger');
    return (reducer: ActionReducer<any>): ActionReducer<any> => reducer;
  }
}
