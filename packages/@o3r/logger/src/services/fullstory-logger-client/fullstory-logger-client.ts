import { Action, ActionReducer, MetaReducer } from '@ngrx/store';
import type { LoggerClient } from '@o3r/logger';

import { FullStory as fullStory, init } from '@fullstory/browser';

/**
 * FullStory client.
 */
export class FullStoryClient implements LoggerClient {
  /**
   * Constructor.
   * @param orgId FullStory organization ID
   */
  constructor(orgId: string) {
    init({orgId});
  }

  /**
   * @inheritdoc
   */
  public identify(uid: string, vars?: {[key: string]: string}): void {
    if (vars && vars.name) {
      fullStory('setIdentity', {uid, properties: {...vars, displayName: vars.name}});
    } else {
      fullStory('setIdentity', {uid, properties: vars});
    }
  }

  /**
   * @inheritdoc
   */
  public event(name: string, properties?: any): void {
    fullStory('trackEvent', {name, properties});
  }

  /**
   * @inheritdoc
   */
  public error(message?: any, ...optionalParams: any[]): void {
    fullStory('log', {level: 'error', msg: `${message.toString() as string}\n${optionalParams.toString()}`});
  }

  /**
   * @inheritdoc
   */
  public warn(message?: any, ...optionalParams: any[]): void {
    fullStory('log', {level: 'warn', msg: `${message.toString() as string}\n${optionalParams.toString()}`});
  }

  /**
   * @inheritdoc
   */
  public log(message?: any, ...optionalParams: any[]): void {
    fullStory('log', {level: 'log', msg: `${message.toString() as string}\n${optionalParams.toString()}`});
  }

  /**
   * @inheritdoc
   */
  public getSessionURL(): string | undefined {
    return fullStory('getSession') || undefined;
  }

  /**
   * @inheritdoc
   */
  public stopRecording(): void {
    fullStory('shutdown');
  }

  /**
   * @inheritdoc
   */
  public resumeRecording(): void {
    fullStory('restart');
  }

  /**
   * @inheritdoc
   */
  public createMetaReducer(): MetaReducer<any, Action> {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const client: FullStoryClient = this;
    // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
    return function debug(reducer: ActionReducer<any>): ActionReducer<any> {
      return (state, action) => {
        // Filter @ngrx actions
        if (!action.type.startsWith('@ngrx/')) {
          client.event('state', state);
          client.event('action', action);
        }

        return reducer(state, action);
      };
    };
  }
}
