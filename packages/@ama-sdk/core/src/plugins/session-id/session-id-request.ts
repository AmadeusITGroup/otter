import {
  v4,
} from 'uuid';
import type {
  Logger,
} from '../../fwk/logger';
import {
  PluginRunner,
  RequestOptions,
  RequestPlugin,
  RequestPluginContext,
} from '../core';

/**
 * Options of the {@link SessionIdRequest} plugin
 */
export interface SessionIdRequestOptions {
  /**
   * The request header in which the ID will be added.
   * @default 'Ama-Client-Ref'
   */
  sessionIdHeader?: string;
  /**
   * Indicates if the request ID part should be added to the ID.
   * @default true
   */
  activateRequestId?: boolean;
  /**
   * Session ID to use instead of a generated one.
   * When provided (non-empty), it takes priority over any session ID already stored for the header and is shared with
   * the other plugin instances using the same header.
   * When absent, a session ID is retrieved from the shared memory or the session storage, or generated.
   */
  sessionId?: string;
}

/**
 * Plugin to add a header with an ID that can be used to track all the calls done by one or several APIs of the SDK.
 *
 * This ID is composed of both a session part and a request part resulting in a unique ID for a single request.
 * It is formatted as "SESSION_ID:REQUEST_ID" where:
 * - SESSION_ID is an UUID identifying the client-side user session (or the session ID supplied via the options)
 * - REQUEST_ID is a unique token within a session matching the [a-zA-Z0-9]{1,10} format
 *
 * The REQUEST_ID can be deactivated. In this case the ID is formatted as "SESSION_ID" only.
 */
export class SessionIdRequest implements RequestPlugin {
  /**
   * Shared memory between plugin instances where we store all the session IDs
   */
  private static readonly sharedMemory: { [key: string]: any } = {};

  /**
   * The request header in which the ID will be added. Use the same in multiple APIs if you want to aggregate logs
   * with one ID.
   */
  private sessionIdHeader: string;

  /**
   * Indicates if the request ID part should be added to the ID.
   */
  private readonly requestIdActivated: boolean;

  /**
   * The session ID used to track API calls
   */
  public sessionId?: string;

  /**
   * Constructor.
   * @param options Options of the plugin
   */
  constructor(options?: SessionIdRequestOptions);
  /**
   * Constructor.
   * @param sessionIdHeader The request header in which the ID will be added.
   * @param activateRequestId Indicates if the request ID part should be added to the ID.
   * @deprecated Will be removed in v16. Pass a {@link SessionIdRequestOptions} object instead.
   */
  constructor(sessionIdHeader?: string, activateRequestId?: boolean);
  constructor(sessionIdHeaderOrOptions?: string | SessionIdRequestOptions, activateRequestId = true) {
    const options: SessionIdRequestOptions = typeof sessionIdHeaderOrOptions === 'object' && sessionIdHeaderOrOptions !== null
      ? sessionIdHeaderOrOptions
      : { sessionIdHeader: sessionIdHeaderOrOptions, activateRequestId };
    // Declaration done first since generateSessionId uses the logger
    this.sessionIdHeader = options.sessionIdHeader ?? 'Ama-Client-Ref';
    this.requestIdActivated = options.activateRequestId ?? true;
    this.sessionId = options.sessionId ? this.useSuppliedSessionId(options.sessionId) : this.generateSessionId();
  }

  private logSessionId(sessionId: string, date: string, logger?: Logger) {
    /* eslint-disable no-console -- console are default value */
    (logger?.info || logger?.log || console.info).bind(logger || console)(`Your debug ID associated to the header "${this.sessionIdHeader}" is: ${sessionId}.`);
    (logger?.info || logger?.log || console.info).bind(logger || console)(`Generated at: ${date}`);
    /* eslint-enable no-console */
  }

  /**
   * Retrieves the session ID currently stored for the header, from the shared memory or the session storage.
   */
  private getStoredSessionId(): string | undefined {
    if (SessionIdRequest.sharedMemory[this.sessionIdHeader]) {
      return SessionIdRequest.sharedMemory[this.sessionIdHeader] as string;
    }
    if (typeof sessionStorage !== 'undefined') {
      try {
        return (JSON.parse(sessionStorage.getItem(this.sessionIdHeader) || 'null') as { id?: string } | null)?.id;
      } catch { /* corrupted session storage content is considered as no stored ID */ }
    }
    return undefined;
  }

  /**
   * Stores the supplied session ID in shared memory and session storage so that it takes priority over any previous one.
   * The request counter is reset when the supplied ID differs from the stored one.
   * @param sessionId The session ID supplied to the plugin
   * @param logger
   */
  private useSuppliedSessionId(sessionId: string, logger?: Logger) {
    const requestCountKey = this.sessionIdHeader + '-Request-Count';
    const isNewSessionId = this.getStoredSessionId() !== sessionId;
    const generatedTime = new Date().toJSON();

    SessionIdRequest.sharedMemory[this.sessionIdHeader] = sessionId;
    if (isNewSessionId) {
      delete SessionIdRequest.sharedMemory[requestCountKey];
    }
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(this.sessionIdHeader, JSON.stringify({ id: sessionId, generatedTime }));
      if (isNewSessionId) {
        sessionStorage.removeItem(requestCountKey);
      }
    }
    this.logSessionId(sessionId, generatedTime, logger);

    return sessionId;
  }

  /** @inheritdoc */
  public load(context?: RequestPluginContext): PluginRunner<RequestOptions, RequestOptions> {
    const sessionId = this.sessionId ||= this.generateSessionId(context?.logger);
    return {
      transform: (data: RequestOptions) => {
        data.headers.append(this.sessionIdHeader, this.requestIdActivated ? `${sessionId}:${this.generateRequestId()}` : sessionId);
        return data;
      }
    };
  }

  /**
   * Generates a session ID and stores it in session / backup storage.
   * @param logger
   */
  public generateSessionId(logger?: Logger) {
    // Check if we already have a session ID in the shared memory
    if (SessionIdRequest.sharedMemory[this.sessionIdHeader]) {
      return SessionIdRequest.sharedMemory[this.sessionIdHeader] as string;
    }

    // if not, check if we have one in session storage
    if (typeof sessionStorage !== 'undefined') {
      const sessionIdObjectFromStorage = sessionStorage.getItem(this.sessionIdHeader);

      if (sessionIdObjectFromStorage) {
        try {
          const parsedSessionIdObject = JSON.parse(sessionIdObjectFromStorage) as { id: string; generatedTime: string };
          // update the shared memory and log the ID to the user
          SessionIdRequest.sharedMemory[this.sessionIdHeader] = parsedSessionIdObject.id;
          this.logSessionId(parsedSessionIdObject.id, parsedSessionIdObject.generatedTime, logger);
          return parsedSessionIdObject.id;
        } catch { /* if the content of the session storage was corrupted somehow we'll just generate a new one */ }
      }
    }

    // else we have to generate a new one
    const sessionId = v4();
    const generatedTime = new Date().toJSON();
    // log it
    this.logSessionId(sessionId, generatedTime, logger);
    // and store it
    SessionIdRequest.sharedMemory[this.sessionIdHeader] = sessionId;
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(this.sessionIdHeader, JSON.stringify({ id: sessionId, generatedTime }));
    }

    return sessionId;
  }

  /**
   * Generates a request ID.
   */
  public generateRequestId() {
    const requestCountKey = this.sessionIdHeader + '-Request-Count';
    let requestCount = Number.NaN;

    // Check if we already have a request count in the shared memory or session storage
    if (SessionIdRequest.sharedMemory[requestCountKey] !== undefined) {
      requestCount = SessionIdRequest.sharedMemory[requestCountKey] as number;
    } else if (typeof sessionStorage !== 'undefined') {
      requestCount = +(sessionStorage.getItem(requestCountKey) || Number.NaN);
    }

    // If the request count is not defined yet or if it has been corrupted somehow, we start at 0.
    requestCount = (requestCount + 1) || 0;

    // Store the new request count
    SessionIdRequest.sharedMemory[requestCountKey] = requestCount;
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(requestCountKey, requestCount.toString());
    }

    return requestCount.toString(36);
  }
}
