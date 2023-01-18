import { Inject, Injectable, Optional } from '@angular/core';
import { Action, MetaReducer } from '@ngrx/store';
import { LoggerClient } from './logger.client';
import { ConsoleLogger } from './logger.console';
import { LOGGER_CLIENT_TOKEN } from './logger.token';

/**
 * Logger service
 */
@Injectable({
  providedIn: 'root'
})
export class LoggerService {

  /** Logger */
  private readonly client: LoggerClient;

  constructor(@Optional() @Inject(LOGGER_CLIENT_TOKEN) client?: LoggerClient) {
    this.client = client || new ConsoleLogger();
  }

  /**
   * Identify a user.
   *
   * @param uid Unique identifier for the current user
   * @param vars Addition information about the user
   */
  public identify(uid: string, vars?: {[key: string]: string}) {
    this.client.identify(uid, vars);
  }

  /**
   * Log custom event.
   *
   * @param name Name of the event to log
   * @param properties Additional properties
   */
  public event(name: string, properties?: any): void {
    this.client.event(name, properties);
  }

  /**
   * Generate a link to the replay of the current session.
   */
  public getClientSessionURL(): string | undefined {
    return this.client.getSessionURL();
  }

  /**
   * Stop recording.
   */
  public stopClientRecording(): void {
    return this.client.stopRecording();
  }

  /**
   * Resume recording.
   */
  public resumeClientRecording(): void {
    return this.client.resumeRecording();
  }

  /**
   * Report an error
   *
   * @param message
   * @param optionalParams
   */
  public error(message?: any, ...optionalParams: any[]) {
    this.client.error(message, ...optionalParams);
  }

  /**
   * Report a warning
   *
   * @param message
   * @param optionalParams
   */
  public warn(message?: any, ...optionalParams: any[]) {
    this.client.warn(message, ...optionalParams);
  }

  /**
   * Log a message
   *
   * @param message
   * @param optionalParams
   */
  public log(message?: any, ...optionalParams: any[]) {
    this.client.log(message, ...optionalParams);
  }

  /**
   * Log a message
   *
   * @param message
   * @param optionalParams
   */
  public info(message?: any, ...optionalParams: any[]) {
    (this.client.info ? this.client.info : this.client.log)(message, ...optionalParams);
  }

  /**
   * Log a debug message
   *
   * @param message
   * @param optionalParams
   */
  public debug(message?: any, ...optionalParams: any[]) {
    this.client.debug?.(message, ...optionalParams);
  }

  /**
   * Create a meta reducer to log ngrx store.
   */
  public createMetaReducer(): MetaReducer<any, Action> | undefined {
    return this.client.createMetaReducer();
  }
}
