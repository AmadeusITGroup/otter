import { Action, ActionReducer, MetaReducer } from '@ngrx/store';
import type { LoggerClient } from '@o3r/logger';

import * as FullStory from '@fullstory/browser';

/**
 * FullStory client.
 */
export class FullStoryClient implements LoggerClient {
  /**
   * Constructor.
   *
   * @param orgId FullStory organization ID
   */
  constructor(orgId: string) {
    FullStory.init({orgId});
  }

  /**
   * @inheritdoc
   */
  public identify(uid: string, vars?: {[key: string]: string}): void {
    if (vars && vars.name) {
      FullStory.identify(uid, {...vars, displayName: vars.name});
    } else {
      FullStory.identify(uid, vars);
    }
  }

  /**
   * @inheritdoc
   */
  public event(name: string, properties?: any): void {
    FullStory.event(name, properties);
  }

  /**
   * @inheritdoc
   */
  public error(message?: any, ...optionalParams: any[]): void {
    FullStory.log('error', `${message.toString() as string}\n${optionalParams.toString()}`);
  }

  /**
   * @inheritdoc
   */
  public warn(message?: any, ...optionalParams: any[]): void {
    FullStory.log('warn', `${message.toString() as string}\n${optionalParams.toString()}`);
  }

  /**
   * @inheritdoc
   */
  public log(message?: any, ...optionalParams: any[]): void {
    FullStory.log('log', `${message.toString() as string}\n${optionalParams.toString()}`);
  }

  /**
   * @inheritdoc
   */
  public getSessionURL(): string | undefined {
    return FullStory.getCurrentSessionURL() || undefined;
  }

  /**
   * @inheritdoc
   */
  public stopRecording(): void {
    FullStory.shutdown();
  }

  /**
   * @inheritdoc
   */
  public resumeRecording(): void {
    FullStory.restart();
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
