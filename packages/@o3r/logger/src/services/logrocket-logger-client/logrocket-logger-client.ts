import {
  Action,
  MetaReducer,
} from '@ngrx/store';
import * as LogRocket from 'logrocket';
import createNgrxMiddleware, {
  Options,
} from 'logrocket-ngrx';
import type {
  LoggerClient,
} from '../logger/index';

/**
 * LogRocket client.
 */
export class LogRocketClient implements LoggerClient {
  /**
   * Meta reducer configuration to change what store related items LogRocket records
   */
  private readonly metaReducerOptions?: Options;

  /**
   * Constructor.
   * @param appId LogROcket application ID
   * @param initOptions Optional configuration to change what LogRocket records
   * @param metaReducerOptions Optional meta reducer configuration to change what store related items LogRocket records
   */
  constructor(appId: string, initOptions?: any, metaReducerOptions?: Options) {
    const defaultOptions = {
      network: {
        requestSanitizer: (request: Request) => {
          // if the url contains '/purchase/orders'
          if (request.url.toLowerCase().includes('/purchase/orders')) {
            // scrub out the body
            return { ...request, body: '' };
          }
          return request;
        }
      }
    };

    LogRocket.init(appId, { ...defaultOptions, ...initOptions });
    this.metaReducerOptions = metaReducerOptions;
  }

  /**
   * @inheritdoc
   */
  public identify(uid: string, vars?: { [key: string]: string }): void {
    LogRocket.identify(uid, vars);
  }

  /**
   * @inheritdoc
   */
  public event(name: string, properties?: any): void {
    const trackEvent = properties ? `${name}: ${properties as string}` : name;
    LogRocket.track(trackEvent);
  }

  /**
   * @inheritdoc
   */
  public error(message?: any, ...optionalParams: any[]): void {
    LogRocket.error(message, optionalParams);
  }

  /**
   * @inheritdoc
   */
  public warn(message?: any, ...optionalParams: any[]): void {
    LogRocket.warn(message, ...optionalParams);
  }

  /**
   * @inheritdoc
   */
  public log(message?: any, ...optionalParams: any[]): void {
    LogRocket.log(message, ...optionalParams);
  }

  /**
   * @inheritdoc
   */
  public getSessionURL(): string | undefined {
    return LogRocket.sessionURL || undefined;
  }

  /**
   * @inheritdoc
   */
  public stopRecording(): void {
    // eslint-disable-next-line no-console -- we don't want to log this Error on LogRocket as it's when LogRocket is wrongly used
    console.error('Impossible to stop recording with LogRocket');
  }

  /**
   * @inheritdoc
   */
  public resumeRecording(): void {
    // eslint-disable-next-line no-console -- we don't want to log this Error on LogRocket as it's when LogRocket is wrongly used
    console.error('Impossible to restart recording with LogRocket.');
  }

  /**
   * @inheritdoc
   */
  public createMetaReducer(): MetaReducer<any, Action> {
    const defaultOptions = {
      actionSanitizer: (action: Action) => {
        // Filter @ngrx actions
        if (action.type.startsWith('@ngrx/')) {
          return null;
        }
        return action;
      }
    };
    return createNgrxMiddleware(LogRocket, { ...defaultOptions, ...this.metaReducerOptions });
  }
}
