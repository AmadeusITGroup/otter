import {
  Action,
  MetaReducer
} from '@ngrx/store';
import type {
  Logger
} from '@o3r/core';

/**
 * Third party client interface.
 */
export interface LoggerClient extends Logger {
  /**
   * Identify a user.
   * @param uid Unique identifier for the current user
   * @param vars Addition information about the user
   */
  identify(uid: string, vars?: { [key: string]: string }): void;

  /**
   * Log custom event.
   * @param name Name of the event to log
   * @param properties Additional properties
   */
  event(name: string, properties?: any): void;

  /**
   * Generate a link to the replay of the current session.
   */
  getSessionURL(): string | undefined;

  /**
   * Stop recording.
   */
  stopRecording(): void;

  /**
   * Resume recording.
   */
  resumeRecording(): void;

  /**
   * Log an error.
   * @param message Message to log
   * @param optionalParams Optional parameters to log
   */
  error(message?: any, ...optionalParams: any[]): void;

  /**
   * Log a warning.
   * @param message Message to log
   * @param optionalParams Optional parameters to log
   */
  warn(message?: any, ...optionalParams: any[]): void;

  /**
   * Log a message.
   * @param message Message to log
   * @param optionalParams Optional parameters to log
   */
  info?(message?: any, ...optionalParams: any[]): void;

  /**
   * Log a message.
   * @param message Message to log
   * @param optionalParams Optional parameters to log
   */
  log(message?: any, ...optionalParams: any[]): void;

  /**
   * Log a debug message.
   * @param message Message to log
   * @param optionalParams Optional parameters to log
   */
  debug?(message?: any, ...optionalParams: any[]): void;

  /**
   * Create a meta reducer to log ngrx store.
   */
  createMetaReducer(): MetaReducer<any, Action>;
}
