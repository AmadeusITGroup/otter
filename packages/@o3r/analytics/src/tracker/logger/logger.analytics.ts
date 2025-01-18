import type {
  Action,
  ActionReducer,
  MetaReducer,
} from '@ngrx/store';
import type {
  LoggerClient,
} from '@o3r/logger';
import type {
  AnalyticsEventReporter,
} from '../services/tracker';

const ignoredFunction = (..._args: any[]) => {};

/**
 * Analytics logger to send the warnings and errors to the analytics services
 */
export class AnalyticsExceptionLogger implements LoggerClient {
  /** @inheritdoc */
  public debug = ignoredFunction;

  /** @inheritdoc */
  public info = ignoredFunction;

  /** @inheritdoc */
  public log = ignoredFunction;

  /** @inheritdoc */
  public identify = ignoredFunction;

  /** @inheritdoc */
  public event = ignoredFunction;

  constructor(private readonly reporter: AnalyticsEventReporter) {}

  /** @inheritdoc */
  public getSessionURL(): string | undefined {
    return undefined;
  }

  /** @inheritdoc */
  public stopRecording(): void {}

  /** @inheritdoc */
  public resumeRecording(): void {}

  /** @inheritdoc */
  public createMetaReducer(): MetaReducer<any, Action<string>> {
    return (reducer: ActionReducer<any>): ActionReducer<any> => reducer;
  }

  /** @inheritdoc */
  public error(message?: any, ...optionalParams: any[]): void {
    this.reporter.reportEvent({
      type: 'event',
      action: 'exception',
      description: [message, ...optionalParams]
        .filter((item) => !!item)
        .join('\n'),
      fatal: true
    });
  }

  /** @inheritdoc */
  public warn(message?: any, ...optionalParams: any[]): void {
    this.reporter.reportEvent({
      type: 'event',
      action: 'exception',
      description: [message, ...optionalParams]
        .filter((item) => !!item)
        .join('\n'),
      fatal: false
    });
  }
}
