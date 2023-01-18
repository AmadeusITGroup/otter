/**
 * Generic error context
 */
interface GenericErrorContext {
  /** Api name */
  apiName?: string;
  /** Operation ID */
  operationId?: string;
}

/**
 * Generic error class
 */
export class GenericError extends Error {

  constructor(message: string, context?: GenericErrorContext) {
    super(
      context
        ? `[SDK] [apiName: ${context.apiName || 'unknown'}] [operationId: ${context.operationId || 'unknown'}] ${message}`
        : `[SDK] ${message}`
    );
  }

}


/**
 * Request failed error class
 */
export class RequestFailedError<T> extends GenericError {

  /**
   * Request status code
   */
  public statusCode: number;

  /**
   * Data decoded from the response body
   */
  public data?: T;

  constructor(message: string, statusCode: number, data?: T, context?: GenericErrorContext) {
    super(`[status: ${statusCode}] ${message}`, context);
    this.statusCode = statusCode;
    this.data = data;
  }

}

/**
 * Empty response error class
 */
export class EmptyResponseError<T> extends GenericError {
  /**
   * Data decoded from the response body
   */
  public data?: T;

  constructor(message: string, data?: T, context?: GenericErrorContext) {
    super(`[Empty response] ${message}`, context);
    this.data = data;
  }
}

/**
 * Response timeout error class
 */
export class ResponseTimeoutError extends GenericError {

  constructor(message: string, context?: GenericErrorContext) {
    super(`[Response timeout] ${message}`, context);
  }
}

/**
 * Response parse error class
 */
export class ResponseJSONParseError extends RequestFailedError<string> {

  constructor(message: string, httpStatus: number, bodyContent?: string, context?: GenericErrorContext) {
    super(`[Response JSON parse error] ${message}`, httpStatus, bodyContent, context);
  }
}

/**
 * Call Canceled error class
 */
export class CanceledCallError<T = any> extends GenericError {

  /**
   * First plugin canceling the call
   */
  public pluginCanceling?: T;

  /**
   * Index of the first plugin canceling the call
   */
  public pluginIndex?: number;

  constructor(message: string, pluginIndex?: number, pluginCanceling?: T, context?: GenericErrorContext) {
    super(`[Canceled call] ${message}`, context);
    this.pluginIndex = pluginIndex;
    this.pluginCanceling = pluginCanceling;
  }
}
