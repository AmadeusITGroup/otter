import { v4 } from 'uuid';
import { PluginRunner, RequestOptions, RequestPlugin, RequestPluginContext } from '../core';
import type { Logger } from '../../fwk/logger';

/**
 * Plugin to add a header with an ID that can be used to track all the calls done by one or several APIs of the SDK.
 *
 * This ID is composed of both a session part and a request part resulting in a unique ID for a single request.
 * It is formatted as "SESSION_ID:REQUEST_ID" where:
 * - SESSION_ID is an UUID identifying the client-side user session
 * - REQUEST_ID is a unique token within a session matching the [a-zA-Z0-9]{1,10} format
 *
 * The REQUEST_ID can be deactivated. In this case the ID is formatted as "SESSION_ID" only.
 */
export class SessionIdRequest implements RequestPlugin {

  /**
   * Shared memory between plugin instances where we store all the session IDs
   */
  private static readonly sharedMemory: {[key: string]: any} = {};

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
   * @param sessionIdHeader The request header in which the ID will be added.
   * @param activateRequestId Indicates if the request ID part should be added to the ID.
   */
  constructor(sessionIdHeader = 'Ama-Client-Ref', activateRequestId = true) {
    // Declaration done first since generateSessionId uses the logger
    this.sessionIdHeader = sessionIdHeader;
    this.requestIdActivated = activateRequestId;
    this.sessionId = this.generateSessionId();
  }

  private logSessionId(sessionId: string, date: string, logger?: Logger) {
    (logger?.info || logger?.log || console.info).bind(logger || console)(`Your debug ID associated to the header "${this.sessionIdHeader}" is: ${sessionId}.`);
    (logger?.info || logger?.log || console.info).bind(logger || console)(`Generated at: ${date}`);
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
          const parsedSessionIdObject = JSON.parse(sessionIdObjectFromStorage);
          // update the shared memory and log the ID to the user
          SessionIdRequest.sharedMemory[this.sessionIdHeader] = parsedSessionIdObject.id;
          this.logSessionId(parsedSessionIdObject.id, parsedSessionIdObject.generatedTime, logger);
          return parsedSessionIdObject.id as string;
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
      sessionStorage.setItem(this.sessionIdHeader, JSON.stringify({id: sessionId, generatedTime}));
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
      requestCount = SessionIdRequest.sharedMemory[requestCountKey];
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
