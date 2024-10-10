import { v4 } from 'uuid';
import type { FetchCall, FetchPlugin, FetchPluginContext } from '../../fetch-plugin';

/**
 * Performance metric mark associated to a call.
 */
export interface Mark {
  /**
   * Id of the mark.
   */
  markId: string;

  /**
   * URL of the call.
   */
  url: string;

  /**
   * Options of the call.
   */
  requestOptions: RequestInit;

  /**
   * Start time of the call.
   */
  startTime: number;

  /**
   * Response of the call.
   */
  response?: Response;

  /**
   * Error of the call.
   */
  error?: Error;

  /**
   * End time of the call.
   */
  endTime?: number;
}
/** Performance object supporting NodeJs Performance and Web Performance reporting  */
type CrossPlatformPerformance = {
  /** @see Performance.mark */
  mark: (...x: Parameters<Performance['mark']>) => ReturnType<Performance['mark']> | void;

  /** @see Performance.measure */
  measure: (measureName: string, startOrMeasureOptions?: string, endMark?: string) => ReturnType<Performance['measure']> | void;
};

/**
 * Options for this plugin.
 */
export interface PerformanceMetricOptions {
  /**
   * Callback function to be called when a mark is closed.
   */
  onMarkComplete: (mark: Mark) => void | Promise<void>;

  /**
   * Callback function to be called when a mark is closed with an error.
   */
  onMarkError: (mark: Mark) => void | Promise<void>;

  /**
   * Callback function called when a mark is opened.
   */
  onMarkOpen: (mark: Mark) => void | Promise<void>;

  /**
   * Instance of the performance reporter to use for performance measurements.
   * @default window.performance on browser only, undefined on node
   */
  performance: CrossPlatformPerformance;

  /**
   * Retrieve the performance tag name
   * @param status status of the call
   * @param markId Mark ID
   */
  getPerformanceTag: (status: string, markId: string) => string;
}

/**
 * Performance metric plugin.
 */
export class PerformanceMetricPlugin implements FetchPlugin {
  /**
   * Callback function called when a mark is closed.
   */
  public onMarkComplete?: (mark: Mark) => void | Promise<void>;

  /**
   * Callback function called when a mark is closed with an error.
   */
  public onMarkError?: (mark: Mark) => void | Promise<void>;

  /**
   * Callback function called when a mark is opened.
   */
  public onMarkOpen?: (mark: Mark) => void | Promise<void>;

  /**
   * Opened marks.
   */
  protected readonly openMarks: {[markId: string]: Mark} = {};

  /**
   * Performance reporter to use for performance measurements.
   * @default window.performance on browser only, undefined on node
   */
  protected readonly performance;

  /**
   * Method used to get the current time as default implementation if no Performance API available.
   * Date.now() is used by default.
   */
  protected getTime: () => number = Date.now;

  constructor(options?: Partial<PerformanceMetricOptions>) {
    this.getPerformanceTag = options?.getPerformanceTag || this.getPerformanceTag;
    this.performance = options?.performance || (typeof window !== 'undefined' ? window.performance : undefined);
    this.onMarkComplete = options ? options.onMarkComplete : this.onMarkComplete;
    this.onMarkError = options ? options.onMarkError : this.onMarkError;
    this.onMarkOpen = options ? options.onMarkOpen : this.onMarkOpen;
  }

  /**
   * Retrieve the performance tag name
   * @param status status of the call
   * @param markId Mark ID
   */
  protected getPerformanceTag = (status: string, markId: string) => `sdk:${status}:${markId}`;


  /**
   * Opens a mark associated to a call.
   * @param url URL of the call associated to the mark to open
   * @param requestOptions Options of the call associated to the mark to open
   */
  public openMark(url: string, requestOptions: RequestInit) {
    const markId = v4();
    const perfMark = this.performance?.mark(this.getPerformanceTag('start', markId)) || undefined;
    const startTime = perfMark?.startTime ?? this.getTime();
    const mark = {
      markId,
      url,
      requestOptions,
      startTime
    } as const satisfies Mark;
    this.openMarks[markId] = mark;
    if (this.onMarkOpen) {
      void this.onMarkOpen(mark);
    }
    return markId;
  }

  /**
   * Closes the mark matching the given mark id.
   * @param markId Id of the mark to close
   * @param response Response of the call associated to the mark to close
   */
  public closeMark(markId: string, response: Response) {
    const perfMark = this.performance?.mark(this.getPerformanceTag('end', markId)) || undefined;
    const endTime = perfMark?.startTime ?? this.getTime();
    this.performance?.measure(this.getPerformanceTag('measure', markId), this.getPerformanceTag('start', markId), this.getPerformanceTag('end', markId));
    const mark = this.openMarks[markId];
    if (!mark) {
      return;
    }
    if (this.onMarkComplete) {
      void this.onMarkComplete({
        ...mark,
        response,
        endTime
      });
    }
    delete this.openMarks[markId];
  }

  /**
   * Closes the mark matching the given mark id with an error.
   * @param markId Id of the mark to close
   * @param error Optional error of the call associated to the mark to close
   */
  public closeMarkWithError(markId: string, error: Error | undefined) {
    const perfMark = this.performance?.mark(this.getPerformanceTag('error', markId)) || undefined;
    const endTime = perfMark?.startTime ?? this.getTime();
    this.performance?.measure(this.getPerformanceTag('measure', markId), this.getPerformanceTag('start', markId), this.getPerformanceTag('error', markId));
    const mark = this.openMarks[markId];
    if (!mark) {
      return;
    }
    if (this.onMarkError) {
      void this.onMarkError({
        ...mark,
        error,
        endTime
      });
    }
    delete this.openMarks[markId];
  }

  /** @inheritDoc */
  public load(context: FetchPluginContext) {
    return {
      transform: async (fetchCall: FetchCall) => {
        const markId = this.openMark(context.url, context.options);

        try {
          const response = await fetchCall;
          this.closeMark(markId, response);
          return response;
        } catch (exception: any) {
          this.closeMarkWithError(markId, exception);
          throw exception;
        }
      }
    };
  }
}
