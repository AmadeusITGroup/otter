/**
 * Note: This file is not part of the running script, it is injected in the browser while running e2e tests.
 */

import { ConditionFn, PostMessageCall } from './core';

// TODO: Move to PollyJS when the winter comes
(() => {
  /**
   * PostMessageInterceptor permits to intercept calls to postMessage.
   */
  const postMessageInterceptor = class PostMessageInterceptor {
    // eslint-disable-next-line no-use-before-define
    private static _instance: PostMessageInterceptor;
    private lastCalls: PostMessageCall[];
    private nativeMethod: any;
    private listening: boolean;
    private conditionFn?: ConditionFn;

    constructor() {
      this.lastCalls = [];
      this.listening = false;
    }

    /**
     * Logs a message in the console
     *
     * @param message
     * @param {...any} args
     */
    private log(message: string, ...args: any[]) {
      // eslint-disable-next-line no-console
      console.log(`#postMessageInterceptor: ${message}`, ...args);
    }

    /**
     * Intercepts the native postMessage call
     *
     * @param ref Singleton instance of the interceptor
     * @param nativeMethod native postMessage method
     * @param args all the args passed to the postMessage
     */
    private interceptor(ref: PostMessageInterceptor, nativeMethod: any, ...args: any[]) {
      this.log('Intercepted', args);
      const postCall: PostMessageCall = {
        data: args[0],
        targetOrigin: args[1],
        timestamp: new Date()
      };
      if (ref.listening) {
        if (ref.conditionFn && !ref.conditionFn(postCall)) {
          this.log('Intercepted message does not pass the condition');
          return;
        }

        ref.lastCalls.push(postCall);
        this.log('Last call count', ref.lastCalls.length);
      } else {
        this.log('Not listening');
      }
      nativeMethod(...args);
    }

    /**
     * Register the interceptor in the window object
     */
    private registerFetchInterceptor() {
      const nativeMethod = window.postMessage;
      this.nativeMethod = nativeMethod;
      Object.assign(window, {postMessage: (...args: any[]) => this.interceptor(this, nativeMethod, ...args)});
    }

    /**
     * Unregister the interceptor from the window object
     */
    private unregisterFetchInterceptor() {
      Object.assign(window, {postMessage: this.nativeMethod});
    }

    /**
     * Returns the singleton instance of the interceptor
     */
    public static getInstance() {
      return this._instance || (this._instance = new this());
    }

    /**
     * Initialize the interceptor
     */
    public init() {
      this.reset();
      this.log('Init');
      this.registerFetchInterceptor();
    }

    /**
     * Stops the interceptor
     */
    public stop() {
      this.reset();
      this.log('Stop');
      this.unregisterFetchInterceptor();
    }

    /**
     * Resets the stack of lastCalls
     */
    public reset() {
      this.lastCalls = [];
    }

    /**
     * Starts listening and saving postMessages
     *
     * @param conditionFnString The function string to be used as condition checker
     */
    public listen(conditionFnString?: string) {
      this.listening = false;
      this.reset();

      if (conditionFnString) {
        // eslint-disable-next-line no-eval
        this.conditionFn = eval(conditionFnString) as ConditionFn;
      }
      this.listening = true;
    }

    /**
     * Stops listening
     * NOTE: It resets the interceptor and clears the conditionFn (if any)
     */
    public stopListening() {
      this.listening = false;
      this.reset();
      this.conditionFn = undefined;
      this.listening = true;
    }

    /**
     * Get the messages stack
     *
     * @param timeoutInterval the interval, in ms, between each check
     * @param retries number of tentatives if fail
     * @param callback
     */
    public getMessages(timeoutInterval: number, retries: number, callback: any) {
      const activeMessageWatch = (remainingRetries: number) => {
        if (remainingRetries === 0 || this.lastCalls.length > 0) {
          const copyCalls = this.lastCalls.slice();
          this.reset();
          callback(copyCalls);
          return;
        } else if (remainingRetries > 0) {
          remainingRetries--;
        }

        setTimeout(() => activeMessageWatch(remainingRetries), timeoutInterval);
      };
      activeMessageWatch(retries);
    }
  };
  Object.assign(window, {postMessageInterceptor});
})();
