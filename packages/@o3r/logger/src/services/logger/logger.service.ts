import {
  Inject,
  Injectable,
  Optional
} from '@angular/core';
import {
  Action,
  MetaReducer
} from '@ngrx/store';
import type {
  Logger
} from '@o3r/core';
import {
  LoggerClient
} from './logger.client';
import {
  ConsoleLogger
} from './logger.console';
import {
  LOGGER_CLIENT_TOKEN
} from './logger.token';

/**
 * Logger service
 */
@Injectable({
  providedIn: 'root'
})
export class LoggerService implements Logger {
  /** Loggers */
  private readonly clients: LoggerClient[];

  /**
   * Record the recording status to make sure that new clients recording status will be consistent with the service
   */
  private recordingState: 'default' | 'resumed' | 'stopped' = 'default';

  constructor(@Optional() @Inject(LOGGER_CLIENT_TOKEN) clients?: LoggerClient | LoggerClient[]) {
    this.clients = clients ? (Array.isArray(clients) ? clients : [clients]) : [new ConsoleLogger()];
  }

  /**
   * Identify a user.
   * @param uid Unique identifier for the current user
   * @param vars Addition information about the user
   */
  public identify(uid: string, vars?: { [key: string]: string }) {
    this.clients.forEach((client) => client.identify(uid, vars));
  }

  /**
   * Log custom event.
   * @param name Name of the event to log
   * @param properties Additional properties
   */
  public event(name: string, properties?: any): void {
    this.clients.forEach((client) => client.event(name, properties));
  }

  /**
   * Generate a link to the replay of the current session.
   */
  public getClientSessionURL(): string | string[] | undefined {
    const sessionUrls = this.clients
      .map((client) => client.getSessionURL())
      .filter((sessionUrl): sessionUrl is string => !!sessionUrl);
    return sessionUrls.length <= 1 ? sessionUrls[0] : sessionUrls;
  }

  /**
   * Register a new client to the logger service
   * @param client
   */
  public registerClient(client: LoggerClient) {
    if (this.clients.includes(client)) {
      this.warn(`Client ${client.constructor.name} already registered`);
      return;
    }
    if (this.recordingState === 'resumed') {
      client.resumeRecording();
    } else if (this.recordingState === 'stopped') {
      client.stopRecording();
    }
    this.clients.push(client);
  }

  /**
   * Stop recording.
   */
  public stopClientRecording(): void {
    this.recordingState = 'stopped';
    this.clients.forEach((client) => client.stopRecording());
  }

  /**
   * Resume recording.
   */
  public resumeClientRecording(): void {
    this.recordingState = 'resumed';
    this.clients.forEach((client) => client.resumeRecording());
  }

  /**
   * Report an error
   * @param message
   * @param optionalParams
   */
  public error(message?: any, ...optionalParams: any[]) {
    this.clients.forEach((client) => client.error(message, ...optionalParams));
  }

  /**
   * Report a warning
   * @param message
   * @param optionalParams
   */
  public warn(message?: any, ...optionalParams: any[]) {
    this.clients.forEach((client) => client.warn(message, ...optionalParams));
  }

  /**
   * Log a message
   * @param message
   * @param optionalParams
   */
  public log(message?: any, ...optionalParams: any[]) {
    this.clients.forEach((client) => client.log(message, ...optionalParams));
  }

  /**
   * Log a message
   * @param message
   * @param optionalParams
   */
  public info(message?: any, ...optionalParams: any[]): void {
    this.clients.forEach((client) => (client.info ? client.info(message, ...optionalParams) : client.log(message, ...optionalParams)));
  }

  /**
   * Log a debug message
   * @param message
   * @param optionalParams
   */
  public debug(message?: any, ...optionalParams: any[]) {
    this.clients.forEach((client) => client.debug?.(message, ...optionalParams));
  }

  /**
   * Create a meta reducer to log ngrx store.
   */
  public createMetaReducer(): MetaReducer<any, Action> | MetaReducer<any, Action>[] | undefined {
    const metaReducers = this.clients
      .map((client) => client.createMetaReducer())
      .filter((metaReducer): metaReducer is MetaReducer<any, Action> => !!metaReducer);
    return metaReducers.length <= 1 ? metaReducers[0] : metaReducers;
  }
}
