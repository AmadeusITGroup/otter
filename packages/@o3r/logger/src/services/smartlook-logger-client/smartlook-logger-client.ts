import {
  Action,
  ActionReducer,
  MetaReducer
} from '@ngrx/store';
import type {
  LoggerClient
} from '@o3r/logger';
import SmartLook from 'smartlook-client';

/**
 * SmartLook client.
 */
export class SmartLookClient implements LoggerClient {
  /**
   * Constructor.
   * @param key SmartLook key
   */
  constructor(key: string) {
    SmartLook.init(key);
  }

  /**
   * @inheritdoc
   */
  public identify(uid: string, vars: { [key: string]: string } = {}): void {
    SmartLook.identify(uid, vars);
  }

  /**
   * @inheritdoc
   */
  public event(name: string, properties?: any): void {
    SmartLook.track(name, properties);
  }

  /**
   * @inheritdoc
   */
  public error(message?: any, ...optionalParams: any[]): void {
    // eslint-disable-next-line no-console
    console.error(message, ...optionalParams);
  }

  /**
   * @inheritdoc
   */
  public warn(message?: any, ...optionalParams: any[]): void {
    console.warn(message, ...optionalParams);
  }

  /**
   * @inheritdoc
   */
  public log(message?: any, ...optionalParams: any[]): void {
    // eslint-disable-next-line no-console
    console.log(message, ...optionalParams);
  }

  /**
   * @inheritdoc
   */
  public getSessionURL(): undefined {
    // eslint-disable-next-line no-console
    console.error('Session URL not implemented in SmartLook client');

    return undefined;
  }

  /**
   * @inheritdoc
   */
  public stopRecording(): void {
    SmartLook.pause();
  }

  /**
   * @inheritdoc
   */
  public resumeRecording(): void {
    SmartLook.resume();
  }

  /**
   * @inheritdoc
   */
  public createMetaReducer(): MetaReducer<any, Action> {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const client: SmartLookClient = this;
    // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
    return function debug(reducer: ActionReducer<any>): ActionReducer<any> {
      return (state, action) => {
        // Filter @ngrx actions
        if (!action.type.startsWith('@ngrx/')) {
          client.log('State', state);
          client.log('Action', action);
        }

        return reducer(state, action);
      };
    };
  }
}
