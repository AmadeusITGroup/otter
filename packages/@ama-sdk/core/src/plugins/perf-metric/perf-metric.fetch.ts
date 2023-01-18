import { v4 } from 'uuid';
import { FetchCall, FetchPlugin, FetchPluginContext } from '../core';

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

/**
 * Options for this plugin.
 */
export interface PerformanceMetricOptions {
  /**
   * Callback function to be called when a mark is closed.
   */
  onMarkComplete: (mark: Mark) => void;

  /**
   * Callback function to be called when a mark is closed with an error.
   */
  onMarkError: (mark: Mark) => void;
}

/**
 * Performance metric plugin.
 */
export class PerformanceMetricPlugin implements FetchPlugin {
  /**
   * Callback function called when a mark is closed.
   */
  public onMarkComplete?: (mark: Mark) => void;

  /**
   * Callback function called when a mark is closed with an error.
   */
  public onMarkError?: (mark: Mark) => void;

  /**
   * Opened marks.
   */
  protected openMarks: {[markId: string]: Mark} = {};

  /**
   * Method used to get the current time.
   * Date.now() is used by default, but we fall back on window.performance.now() if available.
   */
  protected getTime: () => number = Date.now;

  constructor(options?: Partial<PerformanceMetricOptions>) {
    this.onMarkComplete = options ? options.onMarkComplete : this.onMarkComplete;
    this.onMarkError = options ? options.onMarkError : this.onMarkError;

    if (typeof window !== 'undefined' && !!window.performance && !!window.performance.now) {
      this.getTime = () => window.performance.now();
    }
  }

  /**
   * Opens a mark associated to a call.
   *
   * @param url URL of the call associated to the mark to open
   * @param requestOptions Options of the call associated to the mark to open
   */
  public openMark(url: string, requestOptions: RequestInit) {
    const markId = v4();
    this.openMarks = {
      ...this.openMarks,
      [markId]: {
        markId,
        url,
        requestOptions,
        startTime: this.getTime()
      }
    };
    return markId;
  }

  /**
   * Closes the mark matching the given mark id.
   *
   * @param markId Id of the mark to close
   * @param response Response of the call associated to the mark to close
   */
  public closeMark(markId: string, response: Response) {
    const mark = this.openMarks[markId];
    if (!mark) {
      return;
    }
    if (this.onMarkComplete) {
      this.onMarkComplete({
        ...mark,
        response,
        endTime: this.getTime()
      });
    }
    delete this.openMarks[markId];
  }

  /**
   * Closes the mark matching the given mark id with an error.
   *
   * @param markId Id of the mark to close
   * @param error Optional error of the call associated to the mark to close
   */
  public closeMarkWithError(markId: string, error: Error | undefined) {
    const mark = this.openMarks[markId];
    if (!mark) {
      return;
    }
    if (this.onMarkError) {
      this.onMarkError({
        ...mark,
        error,
        endTime: this.getTime()
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
